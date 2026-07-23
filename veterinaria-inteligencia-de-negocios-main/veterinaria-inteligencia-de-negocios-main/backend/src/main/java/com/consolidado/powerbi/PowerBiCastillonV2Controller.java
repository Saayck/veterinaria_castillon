package com.consolidado.powerbi;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Hipervínculo de Power BI PROPIO del sistema Castillón V2 (su portal exclusivo).
 * Mismo patrón que el consolidado pero con clave propia en CONFIGURACION
 * ('powerbi_url_castillonv2'), para que cada software tenga su reporte.
 * La ruta /api/sistemas/castillonv2/** ya autoriza a ADMIN y CASTILLONV2 (URL matcher),
 * así que el operador del portal puede pegar/quitar su propio link.
 */
@RestController
@RequestMapping("/api/sistemas/castillonv2/powerbi")
public class PowerBiCastillonV2Controller {

    private static final String CLAVE = "powerbi_url_castillonv2";

    private final JdbcTemplate jdbc;

    public PowerBiCastillonV2Controller(@Qualifier("consolidadoJdbcTemplate") JdbcTemplate jdbc) {
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
