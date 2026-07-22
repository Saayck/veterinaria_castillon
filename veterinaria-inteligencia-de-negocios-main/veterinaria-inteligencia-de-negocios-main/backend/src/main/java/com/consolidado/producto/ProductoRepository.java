package com.consolidado.producto;

import com.consolidado.dto.ProductoRequest;
import com.consolidado.dto.ProductoResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
public class ProductoRepository {

    /**
     * Un registro se considera activo salvo que su ESTADO sea explicitamente inactivo.
     * El dump real usa '1' para activo y el codigo escribe 'A', asi que en vez de listar
     * los valores "activos" (fragil) excluimos los inactivos conocidos.
     */
    private static final String ACTIVO_WHERE =
            "(ESTADO IS NULL OR ESTADO NOT IN ('I', '0', 'INACTIVO'))";

    private final JdbcTemplate jdbc;

    public ProductoRepository(@Qualifier("consolidadoJdbcTemplate") JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<ProductoResponse> findAll() {
        return jdbc.query(
                "SELECT * FROM PRODUCTO_CONSOLIDADO WHERE " + ACTIVO_WHERE + " ORDER BY ID_REGISTRO",
                this::mapRow
        );
    }

    public Optional<ProductoResponse> findById(Integer id) {
        var list = jdbc.query(
                "SELECT * FROM PRODUCTO_CONSOLIDADO WHERE ID_REGISTRO = ?",
                this::mapRow, id
        );
        return list.isEmpty() ? Optional.empty() : Optional.of(list.getFirst());
    }

    public int insert(ProductoRequest req) {
        return jdbc.update(
                "INSERT INTO PRODUCTO_CONSOLIDADO " +
                "(ID_PRODUCTO, NOMPRODUCTO, DESCRIPCION, CATEGORIA, PRECIO_UNITARIO, " +
                "COSTO_UNITARIO, STOCK_ACTUAL, MARCA, BD_ORIGEN, ESTADO, VERSION, FECH_CARGA) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'A', 0, GETDATE())",
                req.idProducto(), req.nomProducto(), req.descripcion(),
                req.categoria(), req.precioUnitario(), req.costoUnitario(),
                asText(req.stockActual()), req.marca(), req.bdOrigen()
        );
    }

    public Optional<Integer> findIdByExactMatch(ProductoRequest req) {
        // Preferimos ID_PRODUCTO cuando existe; si viene nulo, recuperamos el ultimo
        // registro insertado que coincide por nombre y origen (evita el fallo I7).
        List<Integer> list;
        if (req.idProducto() != null && !req.idProducto().isBlank()) {
            list = jdbc.query(
                    "SELECT ID_REGISTRO FROM PRODUCTO_CONSOLIDADO " +
                    "WHERE ID_PRODUCTO = ? AND " + ACTIVO_WHERE + " ORDER BY ID_REGISTRO DESC",
                    (rs, row) -> rs.getInt("ID_REGISTRO"),
                    req.idProducto()
            );
        } else {
            list = jdbc.query(
                    "SELECT TOP 1 ID_REGISTRO FROM PRODUCTO_CONSOLIDADO " +
                    "WHERE NOMPRODUCTO = ? AND ISNULL(BD_ORIGEN, '') = ISNULL(?, '') " +
                    "AND " + ACTIVO_WHERE + " ORDER BY ID_REGISTRO DESC",
                    (rs, row) -> rs.getInt("ID_REGISTRO"),
                    req.nomProducto(), req.bdOrigen()
            );
        }
        return list.isEmpty() ? Optional.empty() : Optional.of(list.getFirst());
    }

    public int update(ProductoRequest req, Integer id, Integer versionEsperada) {
        return jdbc.update(
                "UPDATE PRODUCTO_CONSOLIDADO SET " +
                "NOMPRODUCTO = ?, DESCRIPCION = ?, CATEGORIA = ?, PRECIO_UNITARIO = ?, " +
                "COSTO_UNITARIO = ?, STOCK_ACTUAL = ?, MARCA = ?, BD_ORIGEN = ?, " +
                "VERSION = VERSION + 1 " +
                "WHERE ID_REGISTRO = ? AND VERSION = ?",
                req.nomProducto(), req.descripcion(), req.categoria(),
                req.precioUnitario(), req.costoUnitario(), asText(req.stockActual()),
                req.marca(), req.bdOrigen(), id, versionEsperada
        );
    }

    public int softDelete(Integer id) {
        return jdbc.update(
                "UPDATE PRODUCTO_CONSOLIDADO SET ESTADO = 'I', VERSION = VERSION + 1 " +
                "WHERE ID_REGISTRO = ?",
                id
        );
    }

    public Optional<Integer> getVersion(Integer id) {
        var list = jdbc.query(
                "SELECT VERSION FROM PRODUCTO_CONSOLIDADO WHERE ID_REGISTRO = ?",
                (rs, row) -> rs.getInt("VERSION"), id
        );
        return list.isEmpty() ? Optional.empty() : Optional.of(list.getFirst());
    }

    private ProductoResponse mapRow(ResultSet rs, int row) throws SQLException {
        return new ProductoResponse(
                rs.getInt("ID_REGISTRO"),
                rs.getString("ID_PRODUCTO"),
                rs.getString("NOMPRODUCTO"),
                rs.getString("DESCRIPCION"),
                rs.getString("CATEGORIA"),
                rs.getBigDecimal("PRECIO_UNITARIO"),
                parseDecimal(rs.getString("COSTO_UNITARIO")),
                parseInt(rs.getString("STOCK_ACTUAL")),
                rs.getString("MARCA"),
                rs.getString("ESTADO"),
                rs.getInt("VERSION"),
                rs.getString("BD_ORIGEN"),
                null
        );
    }

    /** Convierte texto libre del dump (ej. "SIN ESPECIFICAR") a Integer o null. */
    private static Integer parseInt(String value) {
        if (value == null) return null;
        try {
            return Integer.valueOf(value.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /** Convierte texto libre del dump (ej. "SIN ESPECIFICAR") a BigDecimal o null. */
    private static BigDecimal parseDecimal(String value) {
        if (value == null) return null;
        try {
            return new BigDecimal(value.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static String asText(Integer value) {
        return value == null ? null : value.toString();
    }
}
