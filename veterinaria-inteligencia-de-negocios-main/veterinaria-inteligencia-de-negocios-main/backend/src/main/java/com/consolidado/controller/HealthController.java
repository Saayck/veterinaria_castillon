package com.consolidado.controller;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final JdbcTemplate consolidadoJdbc;
    private final JdbcTemplate veterinariaJdbc;

    public HealthController(
            @Qualifier("consolidadoJdbcTemplate") JdbcTemplate consolidadoJdbc,
            @Qualifier("veterinariaJdbcTemplate") JdbcTemplate veterinariaJdbc) {
        this.consolidadoJdbc = consolidadoJdbc;
        this.veterinariaJdbc = veterinariaJdbc;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        boolean consolidadoOk = checkConnection(consolidadoJdbc, "BD_CONSOLIDADO");
        boolean veterinariaOk = checkConnection(veterinariaJdbc, "BD_CASTILLON_VETERINARIA");

        return ResponseEntity.ok(Map.of(
            "ok", consolidadoOk && veterinariaOk,
            "consolidado", consolidadoOk,
            "veterinaria", veterinariaOk
        ));
    }

    private boolean checkConnection(JdbcTemplate jdbc, String name) {
        try {
            jdbc.queryForObject("SELECT 1", Integer.class);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}