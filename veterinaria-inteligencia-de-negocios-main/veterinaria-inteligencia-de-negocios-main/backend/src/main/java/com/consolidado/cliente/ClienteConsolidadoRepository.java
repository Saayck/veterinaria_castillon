package com.consolidado.cliente;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

/**
 * Lectura de CLIENTE_CONSOLIDADO (BD_CONSOLIDADO). Tabla cargada por el ETL con los clientes
 * de todas las fuentes; el filtrado y la paginacion se hacen en servidor para escalar.
 */
@Repository
public class ClienteConsolidadoRepository {

    private final JdbcTemplate jdbc;

    public ClienteConsolidadoRepository(@Qualifier("consolidadoJdbcTemplate") JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public long count(String busqueda) {
        String like = toLike(busqueda);
        Long total = jdbc.queryForObject(
                "SELECT COUNT(*) FROM CLIENTE_CONSOLIDADO " +
                "WHERE (? IS NULL OR NOM_COMPLETO LIKE ? OR EMPRESA LIKE ? OR ID_CLIENTE LIKE ?)",
                Long.class, like, like, like, like
        );
        return total == null ? 0 : total;
    }

    public List<ClienteConsolidadoResponse> find(String busqueda, int page, int size) {
        String like = toLike(busqueda);
        int offset = Math.max(page, 0) * size;
        return jdbc.query(
                "SELECT ID_REGISTRO, ID_CLIENTE, NOMBRE, APELLIDO, NOM_COMPLETO, EMPRESA, " +
                "TIPO_CLIENTE, BD_ORIGEN FROM CLIENTE_CONSOLIDADO " +
                "WHERE (? IS NULL OR NOM_COMPLETO LIKE ? OR EMPRESA LIKE ? OR ID_CLIENTE LIKE ?) " +
                "ORDER BY ID_REGISTRO OFFSET ? ROWS FETCH NEXT ? ROWS ONLY",
                this::mapRow, like, like, like, like, offset, size
        );
    }

    private ClienteConsolidadoResponse mapRow(ResultSet rs, int row) throws SQLException {
        return new ClienteConsolidadoResponse(
                rs.getInt("ID_REGISTRO"),
                rs.getString("ID_CLIENTE"),
                rs.getString("NOMBRE"),
                rs.getString("APELLIDO"),
                rs.getString("NOM_COMPLETO"),
                rs.getString("EMPRESA"),
                rs.getString("TIPO_CLIENTE"),
                rs.getString("BD_ORIGEN")
        );
    }

    private static String toLike(String busqueda) {
        return (busqueda == null || busqueda.isBlank()) ? null : "%" + busqueda.trim() + "%";
    }
}
