package com.consolidado.fuente;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

/**
 * Lectura de SamarImportadora (OLTP importadora): productos en ARTICULOS y clientes en CLIENTES.
 * ARTICULOS no tiene stock, marca ni descripcion; sí trae costo unitario.
 */
@Repository
public class SamarFuenteRepository {

    public static final String BD_ORIGEN = "SamarImportadora";

    private final JdbcTemplate jdbc;

    public SamarFuenteRepository(@Qualifier("samarJdbcTemplate") JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<FuenteProducto> listarProductos() {
        return jdbc.query(
                "SELECT CODIGO_PRODUCTO, NOMBRE, CATEGORIA, PRECIO_UNITARIO, COSTO_UNITARIO FROM ARTICULOS",
                this::mapProducto
        );
    }

    public List<FuenteCliente> listarClientes() {
        return jdbc.query(
                "SELECT ID_CLIENTE, NOMBRE, APELLIDO FROM CLIENTES",
                this::mapCliente
        );
    }

    private FuenteProducto mapProducto(ResultSet rs, int row) throws SQLException {
        return new FuenteProducto(
                rs.getString("CODIGO_PRODUCTO"),
                rs.getString("NOMBRE"),
                null,
                rs.getString("CATEGORIA"),
                rs.getBigDecimal("PRECIO_UNITARIO"),
                rs.getBigDecimal("COSTO_UNITARIO"),
                null,
                null,
                BD_ORIGEN
        );
    }

    private FuenteCliente mapCliente(ResultSet rs, int row) throws SQLException {
        return new FuenteCliente(
                rs.getString("ID_CLIENTE"),
                rs.getString("NOMBRE"),
                rs.getString("APELLIDO"),
                "SIN EMPRESA",
                "PERSONA",
                BD_ORIGEN
        );
    }
}
