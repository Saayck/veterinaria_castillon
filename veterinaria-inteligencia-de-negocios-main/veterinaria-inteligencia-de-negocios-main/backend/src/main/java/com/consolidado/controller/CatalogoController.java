package com.consolidado.controller;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/catalogo")
public class CatalogoController {

    private final JdbcTemplate veterinaria;
    private final JdbcTemplate castillonv2;

    public CatalogoController(@Qualifier("veterinariaJdbcTemplate") JdbcTemplate veterinaria,
                              @Qualifier("castillonv2JdbcTemplate") JdbcTemplate castillonv2) {
        this.veterinaria = veterinaria;
        this.castillonv2 = castillonv2;
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

    /** Catálogo público del sistema Castillón V2 (para la portada de su plataforma). */
    @GetMapping("/castillonv2/productos")
    public List<Map<String, Object>> listarProductosCastillonV2() {
        return castillonv2.query(
            "SELECT P.IDPRODUCTO, P.NOMPRODUCTO, P.DESCRIPCION, " +
            "C.NOMCATEGORIA AS CATEGORIA, P.PRECIO, P.MARCA " +
            "FROM PRODUCTO P " +
            "LEFT JOIN CATEGORIA C ON P.IDCATEGORIA = C.IDCATEGORIA " +
            "WHERE P.ESTADO = '1'",
            (rs, row) -> Map.of(
                "idProducto", rs.getInt("IDPRODUCTO"),
                "nomProducto", rs.getString("NOMPRODUCTO"),
                "descripcion", nvl(rs.getString("DESCRIPCION")),
                "categoria", nvl(rs.getString("CATEGORIA")),
                "marca", nvl(rs.getString("MARCA")),
                "precio", rs.getBigDecimal("PRECIO")
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
            (rs, row) -> {
                // La tabla MASCOTA no tiene columna de nombre propio: se identifica por
                // especie + raza. El dueño es la PERSONA vinculada (nombre completo).
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("idMascota", rs.getInt("IDMASCOTA"));
                m.put("dueno", nombreCompleto(rs.getString("NOMBRE"),
                        rs.getString("APE_PATERNO"), rs.getString("APE_MATERNO")));
                m.put("raza", nvl(rs.getString("RAZA")));
                m.put("especie", nvl(rs.getString("ESPECIE")));
                m.put("genero", nvl(rs.getString("GENERO")));
                m.put("color", nvl(rs.getString("COLOR")));
                m.put("fechNac", rs.getDate("FECHNAC") != null ? rs.getDate("FECHNAC").toString() : "");
                m.put("peso", rs.getBigDecimal("PESO"));
                return m;
            }
        );
    }

    private static String nvl(String value) {
        return value != null ? value : "";
    }

    private static String nombreCompleto(String nombre, String apePaterno, String apeMaterno) {
        return Stream.of(nombre, apePaterno, apeMaterno)
                .filter(s -> s != null && !s.isBlank())
                .collect(Collectors.joining(" "));
    }
}
