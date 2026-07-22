package com.consolidado.producto;

import com.consolidado.dto.ProductoRequest;
import com.consolidado.dto.ProductoResponse;
import com.consolidado.outbox.OutboxRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ProductoService {

    private static final Logger log = LoggerFactory.getLogger(ProductoService.class);

    private final ProductoRepository productoRepo;
    private final OutboxRepository outboxRepo;
    private final ObjectMapper objectMapper;

    public ProductoService(ProductoRepository productoRepo,
                           OutboxRepository outboxRepo,
                           ObjectMapper objectMapper) {
        this.productoRepo = productoRepo;
        this.outboxRepo = outboxRepo;
        this.objectMapper = objectMapper;
    }

    public List<ProductoResponse> listarTodos() {
        log.info("Listando todos los productos activos");
        return productoRepo.findAll();
    }

    public Optional<ProductoResponse> buscarPorId(Integer id) {
        log.info("Buscando producto id={}", id);
        return productoRepo.findById(id);
    }

    @Transactional("consolidadoTransactionManager")
    public ProductoResponse crear(ProductoRequest request) {
        log.info("Creando producto codigo={} nombre={}", request.idProducto(), request.nomProducto());
        productoRepo.insert(request);

        Integer id = productoRepo.findIdByExactMatch(request)
                .orElseThrow(() -> new RuntimeException("Error al obtener ID del producto creado"));

        String payload = toJson(request);

        outboxRepo.insert("PRODUCTO", id, "CREATE", payload, request.bdOrigen());
        log.info("Producto creado id={} y mensaje outbox encolado", id);

        return productoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Error al leer producto creado"));
    }

    @Transactional("consolidadoTransactionManager")
    public ProductoResponse actualizar(Integer id, ProductoRequest request, Integer versionEsperada) {
        log.info("Actualizando producto id={} version_esperada={}", id, versionEsperada);
        int affected = productoRepo.update(request, id, versionEsperada);
        if (affected == 0) {
            log.warn("Conflicto de concurrencia en producto id={} version={}", id, versionEsperada);
            throw new OptimisticLockException(
                    "Conflicto de concurrencia: el producto fue modificado por otro usuario. " +
                    "Recargue los datos e intente nuevamente."
            );
        }

        String payload = toJson(request);
        String bdDestino = request.bdOrigen() != null ? request.bdOrigen() : "BD_CASTILLON_VETERINARIA";
        outboxRepo.insert("PRODUCTO", id, "UPDATE", payload, bdDestino);
        log.info("Producto actualizado id={} y mensaje outbox encolado", id);

        return productoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Error al leer producto actualizado"));
    }

    @Transactional("consolidadoTransactionManager")
    public void eliminar(Integer id) {
        log.info("Eliminando (soft delete) producto id={}", id);
        var producto = productoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado para eliminar"));
        productoRepo.softDelete(id);

        String bdDestino = producto.bdOrigen() != null ? producto.bdOrigen() : "BD_CASTILLON_VETERINARIA";
        outboxRepo.insert("PRODUCTO", id, "DELETE",
                toJson(Map.of(
                        "idProducto", producto.idProducto() != null ? producto.idProducto() : "",
                        "nomProducto", producto.nomProducto() != null ? producto.nomProducto() : ""
                )),
                bdDestino);
        log.info("Producto id={} eliminado y mensaje outbox DELETE encolado", id);
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.error("Error serializando payload outbox", e);
            return "{}";
        }
    }
}