package com.consolidado.controller;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductoController {

    private final JdbcTemplate veterinaria;

    public AdminProductoController(@Qualifier("veterinariaJdbcTemplate") JdbcTemplate veterinaria) {
        this.veterinaria = veterinaria;
    }

    @GetMapping("/productos")
    public List<Map<String, Object>> listar() {
        return veterinaria.query(
            "SELECT P.IDPRODUCTO, P.NOMPRODUCTO, P.DESCRIPCION, " +
            "C.NOMCATEGORIA AS CATEGORIA, " +
            "U.NOMUNIDAD_MEDIDA AS UNIDAD, " +
            "P.PRECIO_UNITARIO, P.STOCK_ACTUAL, P.ESTADO, " +
            "P.IDCATEGORIA, P.IDUNIDAD_MEDIDA, " +
            "P.FECCRE, P.USUCRE " +
            "FROM PRODUCTO P " +
            "LEFT JOIN CATEGORIA C ON P.IDCATEGORIA = C.IDCATEGORIA " +
            "LEFT JOIN UNIDAD_MEDIDA U ON P.IDUNIDAD_MEDIDA = U.IDUNIDAD_MEDIDA " +
            "ORDER BY P.IDPRODUCTO",
            (rs, row) -> Map.ofEntries(
                Map.entry("idProducto", rs.getInt("IDPRODUCTO")),
                Map.entry("nomProducto", rs.getString("NOMPRODUCTO")),
                Map.entry("descripcion", rs.getString("DESCRIPCION")),
                Map.entry("categoria", rs.getString("CATEGORIA")),
                Map.entry("unidad", rs.getString("UNIDAD")),
                Map.entry("idCategoria", rs.getObject("IDCATEGORIA")),
                Map.entry("idUnidad", rs.getObject("IDUNIDAD_MEDIDA")),
                Map.entry("precioUnitario", rs.getBigDecimal("PRECIO_UNITARIO")),
                Map.entry("stockActual", rs.getObject("STOCK_ACTUAL")),
                Map.entry("estado", rs.getString("ESTADO")),
                Map.entry("fecCre", rs.getObject("FECCRE")),
                Map.entry("usuCre", rs.getString("USUCRE"))
            )
        );
    }

    @GetMapping("/categorias")
    public List<Map<String, Object>> listarCategorias() {
        return veterinaria.query(
            "SELECT IDCATEGORIA, NOMCATEGORIA FROM CATEGORIA WHERE ESTADO = '1'",
            (rs, row) -> Map.of("id", rs.getInt("IDCATEGORIA"), "nombre", rs.getString("NOMCATEGORIA"))
        );
    }

    @GetMapping("/unidades")
    public List<Map<String, Object>> listarUnidades() {
        return veterinaria.query(
            "SELECT IDUNIDAD_MEDIDA, NOMUNIDAD_MEDIDA FROM UNIDAD_MEDIDA WHERE ESTADO = '1'",
            (rs, row) -> Map.of("id", rs.getInt("IDUNIDAD_MEDIDA"), "nombre", rs.getString("NOMUNIDAD_MEDIDA"))
        );
    }

    @PostMapping("/productos")
    public Map<String, Object> crear(@RequestBody Map<String, Object> body) {
        veterinaria.update(
            "INSERT INTO PRODUCTO (NOMPRODUCTO, DESCRIPCION, IDCATEGORIA, IDUNIDAD_MEDIDA, PRECIO_UNITARIO, STOCK_ACTUAL, ESTADO, USUCRE, PCCRE, FECCRE) VALUES (?, ?, ?, ?, ?, ?, '1', 'admin', 'PC01', GETDATE())",
            body.get("nomProducto"),
            body.get("descripcion"),
            body.get("idCategoria"),
            body.get("idUnidad"),
            body.get("precioUnitario"),
            body.get("stockActual")
        );
        return Map.of("ok", true);
    }

    @PutMapping("/productos/{id}")
    public Map<String, Object> actualizar(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        veterinaria.update(
            "UPDATE PRODUCTO SET NOMPRODUCTO=?, DESCRIPCION=?, IDCATEGORIA=?, IDUNIDAD_MEDIDA=?, PRECIO_UNITARIO=?, STOCK_ACTUAL=?, USUMOD='admin', PCMOD='PC01', FECMOD=GETDATE() WHERE IDPRODUCTO=?",
            body.get("nomProducto"),
            body.get("descripcion"),
            body.get("idCategoria"),
            body.get("idUnidad"),
            body.get("precioUnitario"),
            body.get("stockActual"),
            id
        );
        return Map.of("ok", true);
    }

    @DeleteMapping("/productos/{id}")
    public Map<String, Object> eliminar(@PathVariable Integer id) {
        veterinaria.update("UPDATE PRODUCTO SET ESTADO='0', USUMOD='admin', PCMOD='PC01', FECMOD=GETDATE() WHERE IDPRODUCTO=?", id);
        return Map.of("ok", true);
    }
}
