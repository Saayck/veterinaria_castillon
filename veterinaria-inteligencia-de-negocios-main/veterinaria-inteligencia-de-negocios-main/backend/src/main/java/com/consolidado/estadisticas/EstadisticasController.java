package com.consolidado.estadisticas;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Agregados de la base consolidada para el panel de Análisis (KPIs y distribuciones).
 * Solo lectura; disponible para cualquier usuario autenticado (ADMIN y USER).
 */
@RestController
@RequestMapping("/api/consolidado/estadisticas")
public class EstadisticasController {

    // Un registro cuenta como activo salvo que su ESTADO sea explícitamente inactivo.
    private static final String PROD_ACTIVO = "(ESTADO IS NULL OR ESTADO NOT IN ('I','0','INACTIVO'))";

    private final JdbcTemplate jdbc;

    public EstadisticasController(@Qualifier("consolidadoJdbcTemplate") JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping
    public Map<String, Object> estadisticas() {
        return Map.of(
                "productos", productos(),
                "clientes", clientes()
        );
    }

    private Map<String, Object> productos() {
        Long total = jdbc.queryForObject(
                "SELECT COUNT(*) FROM PRODUCTO_CONSOLIDADO WHERE " + PROD_ACTIVO, Long.class);

        List<Map<String, Object>> porFuente = jdbc.queryForList(
                "SELECT BD_ORIGEN AS fuente, COUNT(*) AS total FROM PRODUCTO_CONSOLIDADO " +
                "WHERE " + PROD_ACTIVO + " GROUP BY BD_ORIGEN ORDER BY total DESC");

        List<Map<String, Object>> porCategoria = jdbc.queryForList(
                "SELECT TOP 5 ISNULL(CATEGORIA,'(sin categoría)') AS categoria, COUNT(*) AS total " +
                "FROM PRODUCTO_CONSOLIDADO WHERE " + PROD_ACTIVO + " GROUP BY CATEGORIA ORDER BY total DESC");

        Map<String, Object> precio = jdbc.queryForMap(
                "SELECT AVG(PRECIO_UNITARIO) AS promedio, MIN(PRECIO_UNITARIO) AS minimo, " +
                "MAX(PRECIO_UNITARIO) AS maximo FROM PRODUCTO_CONSOLIDADO WHERE " + PROD_ACTIVO +
                " AND PRECIO_UNITARIO IS NOT NULL");

        Long sinCosto = jdbc.queryForObject(
                "SELECT COUNT(*) FROM PRODUCTO_CONSOLIDADO WHERE " + PROD_ACTIVO +
                " AND (COSTO_UNITARIO IS NULL OR ISNUMERIC(COSTO_UNITARIO) = 0)", Long.class);

        Long sinStock = jdbc.queryForObject(
                "SELECT COUNT(*) FROM PRODUCTO_CONSOLIDADO WHERE " + PROD_ACTIVO +
                " AND (STOCK_ACTUAL IS NULL OR ISNUMERIC(STOCK_ACTUAL) = 0)", Long.class);

        return Map.of(
                "total", total,
                "porFuente", porFuente,
                "porCategoria", porCategoria,
                "precio", precio,
                "sinCosto", sinCosto,
                "sinStock", sinStock
        );
    }

    private Map<String, Object> clientes() {
        Long total = jdbc.queryForObject("SELECT COUNT(*) FROM CLIENTE_CONSOLIDADO", Long.class);

        List<Map<String, Object>> porFuente = jdbc.queryForList(
                "SELECT BD_ORIGEN AS fuente, COUNT(*) AS total FROM CLIENTE_CONSOLIDADO " +
                "GROUP BY BD_ORIGEN ORDER BY total DESC");

        List<Map<String, Object>> porTipo = jdbc.queryForList(
                "SELECT ISNULL(TIPO_CLIENTE,'(sin tipo)') AS tipo, COUNT(*) AS total FROM CLIENTE_CONSOLIDADO " +
                "GROUP BY TIPO_CLIENTE ORDER BY total DESC");

        return Map.of(
                "total", total,
                "porFuente", porFuente,
                "porTipo", porTipo
        );
    }
}
