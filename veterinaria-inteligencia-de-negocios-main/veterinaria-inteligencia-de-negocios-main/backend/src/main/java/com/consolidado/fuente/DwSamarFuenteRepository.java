package com.consolidado.fuente;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

/**
 * Lectura del Data Warehouse DW_SamarImportadora (esquema estrella). Solo aporta clientes
 * (dimension DIM_CLIENTE); no tiene dimension de productos, por eso no expone listarProductos.
 */
@Repository
public class DwSamarFuenteRepository {

    public static final String BD_ORIGEN = "DW_SamarImportadora";

    private final JdbcTemplate jdbc;

    public DwSamarFuenteRepository(@Qualifier("dwsamarJdbcTemplate") JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<FuenteCliente> listarClientes() {
        return jdbc.query(
                "SELECT ID_CLIENTE, NOMBRE_COMPLETO FROM DIM_CLIENTE",
                this::mapCliente
        );
    }

    private FuenteCliente mapCliente(ResultSet rs, int row) throws SQLException {
        // La dimension solo trae el nombre completo; lo dejamos como nombre y apellido vacio,
        // asi FuenteCliente.nombreCompleto() devuelve el valor original.
        return new FuenteCliente(
                rs.getString("ID_CLIENTE"),
                rs.getString("NOMBRE_COMPLETO"),
                "",
                "SIN EMPRESA",
                "PERSONA",
                BD_ORIGEN
        );
    }
}
