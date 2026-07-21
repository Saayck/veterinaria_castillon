package com.consolidado.outbox;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class OutboxRepository {

    private final JdbcTemplate jdbc;

    public OutboxRepository(@Qualifier("consolidadoJdbcTemplate") JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void insert(String tablaDestino, Integer idRegistro, String operacion,
                       String payload, String bdDestino) {
        jdbc.update(
                "INSERT INTO OUTBOX (TABLA_DESTINO, ID_REGISTRO, OPERACION, PAYLOAD, BD_DESTINO, ESTADO_SYNC) " +
                "VALUES (?, ?, ?, ?, ?, 'PENDIENTE')",
                tablaDestino, idRegistro, operacion, payload, bdDestino
        );
    }

    public List<OutboxMessage> findPending(int limit) {
        return jdbc.query(
                "SELECT ID_OUTBOX, TABLA_DESTINO, ID_REGISTRO, OPERACION, PAYLOAD, " +
                "BD_DESTINO, INTENTOS FROM OUTBOX WITH (UPDLOCK, READPAST) " +
                "WHERE ESTADO_SYNC = 'PENDIENTE' ORDER BY FECHA_CREACION ASC " +
                "OFFSET 0 ROWS FETCH NEXT ? ROWS ONLY",
                (rs, row) -> new OutboxMessage(
                        rs.getLong("ID_OUTBOX"),
                        rs.getString("TABLA_DESTINO"),
                        rs.getInt("ID_REGISTRO"),
                        rs.getString("OPERACION"),
                        rs.getString("PAYLOAD"),
                        rs.getString("BD_DESTINO"),
                        rs.getInt("INTENTOS")
                ),
                limit
        );
    }

    public void markSuccess(long idOutbox) {
        jdbc.update(
                "UPDATE OUTBOX SET ESTADO_SYNC = 'SINCRONIZADO', FECHA_PROCESO = GETDATE() " +
                "WHERE ID_OUTBOX = ?",
                idOutbox
        );
    }

    public void markError(long idOutbox, String mensajeError) {
        jdbc.update(
                "UPDATE OUTBOX SET ESTADO_SYNC = 'ERROR_SYNC', INTENTOS = INTENTOS + 1, " +
                "MENSAJE_ERROR = ? WHERE ID_OUTBOX = ?",
                mensajeError, idOutbox
        );
    }
}