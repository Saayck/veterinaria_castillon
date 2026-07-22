package com.consolidado.powerbi;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Gestiona el hipervínculo del reporte de Power BI publicado en la nube.
 * Es UN solo link (el reporte contiene los dashboards como páginas); se guarda en
 * BD_CONSOLIDADO.CONFIGURACION (clave 'powerbi_url').
 *  - GET (cualquier autenticado): devuelve la URL guardada.
 *  - PUT (solo ADMIN): guarda la URL pegada desde la UI.
 */
@RestController
@RequestMapping("/api/consolidado/powerbi")
public class PowerBiController {

    private static final String CLAVE = "powerbi_url";

    private final JdbcTemplate jdbc;

    public PowerBiController(@Qualifier("consolidadoJdbcTemplate") JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping
    public Map<String, String> obtener() {
        List<String> valores = jdbc.query(
                "SELECT VALOR FROM CONFIGURACION WHERE CLAVE = ?",
                (rs, row) -> rs.getString("VALOR"), CLAVE);
        String url = valores.isEmpty() || valores.getFirst() == null ? "" : valores.getFirst();
        return Map.of("url", url);
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> guardar(@RequestBody Map<String, String> body) {
        String url = body.get("url");
        String limpio = (url == null || url.isBlank()) ? null : url.trim();
        // Upsert de la clave
        int filas = jdbc.update("UPDATE CONFIGURACION SET VALOR = ? WHERE CLAVE = ?", limpio, CLAVE);
        if (filas == 0) {
            jdbc.update("INSERT INTO CONFIGURACION (CLAVE, VALOR) VALUES (?, ?)", CLAVE, limpio);
        }
        return ResponseEntity.ok(Map.of("ok", true, "url", limpio != null ? limpio : ""));
    }
}
