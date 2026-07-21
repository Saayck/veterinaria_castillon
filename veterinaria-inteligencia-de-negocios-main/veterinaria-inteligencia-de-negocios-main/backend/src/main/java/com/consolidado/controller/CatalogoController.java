package com.consolidado.controller;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/catalogo")
public class CatalogoController {

    private final JdbcTemplate veterinaria;

    public CatalogoController(@Qualifier("veterinariaJdbcTemplate") JdbcTemplate veterinaria) {
        this.veterinaria = veterinaria;
    }

    @GetMapping("/productos")
    public List<Map<String, Object>> listarProductos() {
        return veterinaria.query(
            "SELECT P.IDPRODUCTO, P.NOMPRODUCTO, P.DESCRIPCION, " +
            "C.NOMCATEGORIA AS CATEGORIA, " +
            "U.NOMUNIDAD_MEDIDA AS UNIDAD, " +
            "P.PRECIO_UNITARIO, P.STOCK_ACTUAL " +
            "FROM PRODUCTO P " +
            "LEFT JOIN CATEGORIA C ON P.IDCATEGORIA = C.IDCATEGORIA " +
            "LEFT JOIN UNIDAD_MEDIDA U ON P.IDUNIDAD_MEDIDA = U.IDUNIDAD_MEDIDA " +
            "WHERE P.ESTADO = '1'",
            (rs, row) -> Map.of(
                "idProducto", rs.getInt("IDPRODUCTO"),
                "nomProducto", rs.getString("NOMPRODUCTO"),
                "descripcion", rs.getString("DESCRIPCION") != null ? rs.getString("DESCRIPCION") : "",
                "categoria", rs.getString("CATEGORIA") != null ? rs.getString("CATEGORIA") : "",
                "unidad", rs.getString("UNIDAD") != null ? rs.getString("UNIDAD") : "",
                "precioUnitario", rs.getBigDecimal("PRECIO_UNITARIO"),
                "stockActual", rs.getInt("STOCK_ACTUAL")
            )
        );
    }

    @GetMapping("/mascotas")
    public List<Map<String, Object>> listarMascotas() {
        return veterinaria.query(
            "SELECT M.IDMASCOTA, M.GENERO, M.COLOR, M.FECHNAC, M.PESO, " +
            "R.NOMRAZA AS RAZA, E.NOMESPECIE AS ESPECIE, " +
            "P.NOMBRE, P.APE_PATERNO, P.APE_MATERNO " +
            "FROM MASCOTA M " +
            "LEFT JOIN RAZA R ON M.IDRAZA = R.IDRAZA " +
            "LEFT JOIN ESPECIE E ON R.IDESPECIE = E.IDESPECIE " +
            "LEFT JOIN PERSONA P ON M.IDPERSONA = P.IDPERSONA " +
            "WHERE M.ESTADO = '1'",
            (rs, row) -> Map.of(
                "idMascota", rs.getInt("IDMASCOTA"),
                "nombre", rs.getString("NOMBRE") + " " + rs.getString("APE_PATERNO"),
                "raza", rs.getString("RAZA") != null ? rs.getString("RAZA") : "",
                "especie", rs.getString("ESPECIE") != null ? rs.getString("ESPECIE") : "",
                "genero", rs.getString("GENERO") != null ? rs.getString("GENERO") : "",
                "color", rs.getString("COLOR") != null ? rs.getString("COLOR") : "",
                "fechNac", rs.getDate("FECHNAC") != null ? rs.getDate("FECHNAC").toString() : "",
                "peso", rs.getBigDecimal("PESO")
            )
        );
    }
}
