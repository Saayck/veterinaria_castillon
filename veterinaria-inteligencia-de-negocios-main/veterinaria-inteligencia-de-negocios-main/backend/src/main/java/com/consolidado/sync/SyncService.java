package com.consolidado.sync;

import com.consolidado.outbox.OutboxMessage;
import com.consolidado.outbox.OutboxRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class SyncService {

    private final JdbcTemplate veterinaria;
    private final OutboxRepository outboxRepo;
    private final ObjectMapper objectMapper;

    public SyncService(@Qualifier("veterinariaJdbcTemplate") JdbcTemplate veterinaria,
                       OutboxRepository outboxRepo,
                       ObjectMapper objectMapper) {
        this.veterinaria = veterinaria;
        this.outboxRepo = outboxRepo;
        this.objectMapper = objectMapper;
    }

    public void processMessages(int limit) {
        var messages = outboxRepo.findPending(limit);
        for (var msg : messages) {
            try {
                switch (msg.operacion()) {
                    case "CREATE" -> handleCreate(msg);
                    case "UPDATE" -> handleUpdate(msg);
                    case "DELETE" -> handleDelete(msg);
                }
                outboxRepo.markSuccess(msg.idOutbox());
            } catch (Exception e) {
                outboxRepo.markError(msg.idOutbox(), truncar(e.getMessage()));
            }
        }
    }

    private void handleCreate(OutboxMessage msg) {
        Map<String, Object> data = parsePayload(msg.payload());
        veterinaria.update(
                "INSERT INTO PRODUCTO (CODIGO, NOMPRODUCTO, DESCRIPCION, PRECIO_UNITARIO, ESTADO) " +
                "VALUES (?, ?, ?, ?, 'A')",
                data.getOrDefault("idProducto", ""),
                data.getOrDefault("nomProducto", ""),
                data.getOrDefault("descripcion", ""),
                toBigDecimal(data.get("precioUnitario"))
        );
    }

    private void handleUpdate(OutboxMessage msg) {
        Map<String, Object> data = parsePayload(msg.payload());
        var codigo = data.getOrDefault("idProducto", "");
        veterinaria.update(
                "UPDATE PRODUCTO SET NOMPRODUCTO = ?, DESCRIPCION = ?, PRECIO_UNITARIO = ? " +
                "WHERE CODIGO = ? AND ESTADO = 'A'",
                data.getOrDefault("nomProducto", ""),
                data.getOrDefault("descripcion", ""),
                toBigDecimal(data.get("precioUnitario")),
                codigo
        );
    }

    private void handleDelete(OutboxMessage msg) {
        Map<String, Object> data = parsePayload(msg.payload());
        var codigo = data.getOrDefault("idProducto", "");
        veterinaria.update(
                "UPDATE PRODUCTO SET ESTADO = 'I' WHERE CODIGO = ? AND ESTADO = 'A'",
                codigo
        );
    }

    private Map<String, Object> parsePayload(String payload) {
        try {
            return objectMapper.readValue(payload, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return Map.of("nomProducto", payload);
        }
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        return BigDecimal.ZERO;
    }

    private String truncar(String msg) {
        return msg != null && msg.length() > 500 ? msg.substring(0, 500) : msg;
    }
}