package com.consolidado.cliente;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Expone CLIENTE_CONSOLIDADO (solo lectura, requiere autenticacion). Devuelve la pagina de
 * resultados junto con el total para que el frontend pueda paginar los ~2 300 registros.
 */
@RestController
@RequestMapping("/api/consolidado/clientes")
public class ClienteConsolidadoController {

    private static final int MAX_SIZE = 100;

    private final ClienteConsolidadoRepository repo;

    public ClienteConsolidadoController(ClienteConsolidadoRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> listar(
            @RequestParam(required = false) String busqueda,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        int safeSize = Math.min(Math.max(size, 1), MAX_SIZE);
        List<ClienteConsolidadoResponse> contenido = repo.find(busqueda, page, safeSize);
        long total = repo.count(busqueda);

        return ResponseEntity.ok(Map.of(
                "contenido", contenido,
                "total", total,
                "page", Math.max(page, 0),
                "size", safeSize
        ));
    }
}
