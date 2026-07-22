package com.consolidado.importacion;

import com.consolidado.fuente.CastillonV2FuenteRepository;
import com.consolidado.fuente.DwSamarFuenteRepository;
import com.consolidado.fuente.FuenteCliente;
import com.consolidado.fuente.FuenteProducto;
import com.consolidado.fuente.SamarFuenteRepository;
import com.consolidado.fuente.VeterinariaFuenteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * ETL directo: lee productos y clientes de las 4 fuentes (veterinaria, castillonv2, samar OLTP
 * y el DW samar) y los inserta/actualiza en PRODUCTO_CONSOLIDADO / CLIENTE_CONSOLIDADO.
 * El emparejamiento es por (ID, BD_ORIGEN), unico dentro de cada fuente, por lo que reejecutar
 * la importacion es idempotente. El DW solo aporta clientes (no tiene dimension de productos).
 */
@Service
public class ImportacionService {

    private static final Logger log = LoggerFactory.getLogger(ImportacionService.class);

    private final VeterinariaFuenteRepository veterinaria;
    private final CastillonV2FuenteRepository castillonv2;
    private final SamarFuenteRepository samar;
    private final DwSamarFuenteRepository dwsamar;
    private final JdbcTemplate consolidado;

    public ImportacionService(VeterinariaFuenteRepository veterinaria,
                              CastillonV2FuenteRepository castillonv2,
                              SamarFuenteRepository samar,
                              DwSamarFuenteRepository dwsamar,
                              @Qualifier("consolidadoJdbcTemplate") JdbcTemplate consolidado) {
        this.veterinaria = veterinaria;
        this.castillonv2 = castillonv2;
        this.samar = samar;
        this.dwsamar = dwsamar;
        this.consolidado = consolidado;
    }

    /** Importa productos y clientes de las 4 fuentes; devuelve el conteo por entidad y origen. */
    @Transactional("consolidadoTransactionManager")
    public Map<String, Map<String, Integer>> importarTodo(String usuario) {
        Map<String, Integer> productos = new LinkedHashMap<>();
        productos.put(VeterinariaFuenteRepository.BD_ORIGEN, importarProductos(veterinaria.listarProductos(), usuario));
        productos.put(CastillonV2FuenteRepository.BD_ORIGEN, importarProductos(castillonv2.listarProductos(), usuario));
        productos.put(SamarFuenteRepository.BD_ORIGEN, importarProductos(samar.listarProductos(), usuario));

        Map<String, Integer> clientes = new LinkedHashMap<>();
        clientes.put(VeterinariaFuenteRepository.BD_ORIGEN, importarClientes(veterinaria.listarClientes()));
        clientes.put(CastillonV2FuenteRepository.BD_ORIGEN, importarClientes(castillonv2.listarClientes()));
        clientes.put(SamarFuenteRepository.BD_ORIGEN, importarClientes(samar.listarClientes()));
        clientes.put(DwSamarFuenteRepository.BD_ORIGEN, importarClientes(dwsamar.listarClientes()));

        log.info("Importacion consolidado: productos={} clientes={}", productos, clientes);
        return Map.of("productos", productos, "clientes", clientes);
    }

    private int importarProductos(List<FuenteProducto> productos, String usuario) {
        for (FuenteProducto p : productos) {
            upsertProducto(p, usuario);
        }
        return productos.size();
    }

    private int importarClientes(List<FuenteCliente> clientes) {
        for (FuenteCliente c : clientes) {
            upsertCliente(c);
        }
        return clientes.size();
    }

    private void upsertProducto(FuenteProducto p, String usuario) {
        int affected = consolidado.update(
                "UPDATE PRODUCTO_CONSOLIDADO SET NOMPRODUCTO = ?, DESCRIPCION = ?, CATEGORIA = ?, " +
                "PRECIO_UNITARIO = ?, COSTO_UNITARIO = ?, STOCK_ACTUAL = ?, MARCA = ?, ESTADO = 'A', " +
                "VERSION = VERSION + 1, USUMOD = ?, FECMOD = CONVERT(VARCHAR(30), GETDATE(), 120) " +
                "WHERE ID_PRODUCTO = ? AND BD_ORIGEN = ?",
                p.nombre(), p.descripcion(), p.categoria(), p.precio(),
                asText(p.costo()), asText(p.stock()), p.marca(), usuario, p.idOrigen(), p.bdOrigen()
        );
        if (affected == 0) {
            consolidado.update(
                    "INSERT INTO PRODUCTO_CONSOLIDADO " +
                    "(ID_PRODUCTO, NOMPRODUCTO, DESCRIPCION, CATEGORIA, PRECIO_UNITARIO, COSTO_UNITARIO, STOCK_ACTUAL, " +
                    "MARCA, BD_ORIGEN, ESTADO, VERSION, FECH_CARGA, USUCRE, FECCRE) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'A', 0, GETDATE(), ?, CONVERT(VARCHAR(30), GETDATE(), 120))",
                    p.idOrigen(), p.nombre(), p.descripcion(), p.categoria(), p.precio(),
                    asText(p.costo()), asText(p.stock()), p.marca(), p.bdOrigen(), usuario
            );
        }
    }

    private void upsertCliente(FuenteCliente c) {
        int affected = consolidado.update(
                "UPDATE CLIENTE_CONSOLIDADO SET NOMBRE = ?, APELLIDO = ?, NOM_COMPLETO = ?, " +
                "EMPRESA = ?, TIPO_CLIENTE = ?, FECH_CARGA = GETDATE() " +
                "WHERE ID_CLIENTE = ? AND BD_ORIGEN = ?",
                c.nombre(), c.apellido(), c.nombreCompleto(), c.empresa(), c.tipoCliente(),
                c.idOrigen(), c.bdOrigen()
        );
        if (affected == 0) {
            consolidado.update(
                    "INSERT INTO CLIENTE_CONSOLIDADO " +
                    "(ID_CLIENTE, NOMBRE, APELLIDO, NOM_COMPLETO, EMPRESA, TIPO_CLIENTE, BD_ORIGEN, FECH_CARGA) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE())",
                    c.idOrigen(), c.nombre(), c.apellido(), c.nombreCompleto(),
                    c.empresa(), c.tipoCliente(), c.bdOrigen()
            );
        }
    }

    private static String asText(Integer value) {
        return value == null ? null : value.toString();
    }

    private static String asText(java.math.BigDecimal value) {
        return value == null ? null : value.toPlainString();
    }
}
