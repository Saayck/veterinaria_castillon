package com.consolidado.importacion;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Map;

/**
 * Dispara el ETL que consolida los productos de las 3 bases hacia PRODUCTO_CONSOLIDADO.
 * Solo ADMIN. Devuelve el conteo de registros procesados por fuente.
 */
@RestController
@RequestMapping("/api/consolidado/importar")
public class ImportacionController {

    private final ImportacionService importacionService;

    public ImportacionController(ImportacionService importacionService) {
        this.importacionService = importacionService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> importar(Principal principal) {
        String usuario = principal != null ? principal.getName() : "sistema";
        Map<String, Map<String, Integer>> resultado = importacionService.importarTodo(usuario);
        return ResponseEntity.ok(Map.of(
                "ok", true,
                "procesados", resultado
        ));
    }
}
