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

    private final JdbcTemplate jdbc;

    public ProductoRepository(@Qualifier("consolidadoJdbcTemplate") JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<ProductoResponse> findAll() {
        return jdbc.query(
                "SELECT * FROM PRODUCTO_CONSOLIDADO WHERE ESTADO = 'A'",
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
                "COSTO_UNITARIO, STOCK_ACTUAL, BD_ORIGEN, ESTADO, VERSION) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'A', 0)",
                req.idProducto(), req.nomProducto(), req.descripcion(),
                req.categoria(), req.precioUnitario(), req.costoUnitario(),
                req.stockActual(), req.bdOrigen()
        );
    }

    public Optional<Integer> findIdByExactMatch(ProductoRequest req) {
        var list = jdbc.query(
                "SELECT ID_REGISTRO, VERSION FROM PRODUCTO_CONSOLIDADO " +
                "WHERE ID_PRODUCTO = ? AND ESTADO = 'A'",
                (rs, row) -> rs.getInt("ID_REGISTRO"),
                req.idProducto()
        );
        return list.isEmpty() ? Optional.empty() : Optional.of(list.getFirst());
    }

    public int update(ProductoRequest req, Integer id, Integer versionEsperada) {
        return jdbc.update(
                "UPDATE PRODUCTO_CONSOLIDADO SET " +
                "NOMPRODUCTO = ?, DESCRIPCION = ?, CATEGORIA = ?, PRECIO_UNITARIO = ?, " +
                "COSTO_UNITARIO = ?, STOCK_ACTUAL = ?, BD_ORIGEN = ?, " +
                "VERSION = VERSION + 1 " +
                "WHERE ID_REGISTRO = ? AND VERSION = ?",
                req.nomProducto(), req.descripcion(), req.categoria(),
                req.precioUnitario(), req.costoUnitario(), req.stockActual(),
                req.bdOrigen(), id, versionEsperada
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
                rs.getString("COSTO_UNITARIO"),
                rs.getString("STOCK_ACTUAL"),
                rs.getString("ESTADO"),
                rs.getInt("VERSION"),
                rs.getString("BD_ORIGEN"),
                null
        );
    }
}