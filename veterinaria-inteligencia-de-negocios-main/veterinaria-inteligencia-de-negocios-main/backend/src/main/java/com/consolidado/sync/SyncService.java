package com.consolidado.sync;

import com.consolidado.outbox.OutboxMessage;
import com.consolidado.outbox.OutboxRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Consumidor del patron Outbox: propaga los cambios de PRODUCTO_CONSOLIDADO hacia
 * la base de origen indicada en BD_DESTINO. Soporta las dos fuentes reales:
 *  - BD_CASTILLON_VETERINARIA (PRODUCTO con PRECIO_UNITARIO / STOCK_ACTUAL, ESTADO '1'/'0')
 *  - CASTILLONV2              (PRODUCTO con PRECIO / MARCA, ESTADO '1'/'0')
 *
 * Como no existe una clave compartida entre el consolidado y las fuentes, el emparejamiento
 * se hace por NOMPRODUCTO (upsert): se intenta UPDATE y, si no afecta filas, se INSERTA.
 */
@Service
public class SyncService {

    private static final Logger log = LoggerFactory.getLogger(SyncService.class);

    private static final String DESTINO_VETERINARIA = "BD_CASTILLON_VETERINARIA";
    private static final String DESTINO_CASTILLONV2 = "CASTILLONV2";

    private final JdbcTemplate veterinaria;
    private final JdbcTemplate castillonv2;
    private final OutboxRepository outboxRepo;
    private final ObjectMapper objectMapper;

    public SyncService(@Qualifier("veterinariaJdbcTemplate") JdbcTemplate veterinaria,
                       @Qualifier("castillonv2JdbcTemplate") JdbcTemplate castillonv2,
                       OutboxRepository outboxRepo,
                       ObjectMapper objectMapper) {
        this.veterinaria = veterinaria;
        this.castillonv2 = castillonv2;
        this.outboxRepo = outboxRepo;
        this.objectMapper = objectMapper;
    }

    public void processMessages(int limit) {
        var messages = outboxRepo.findPending(limit);
        for (var msg : messages) {
            try {
                switch (msg.operacion()) {
                    case "CREATE", "UPDATE" -> upsert(msg);
                    case "DELETE" -> delete(msg);
                    default -> log.warn("Operacion outbox desconocida: {}", msg.operacion());
                }
                outboxRepo.markSuccess(msg.idOutbox());
            } catch (Exception e) {
                log.error("Error sincronizando outbox id={} destino={}", msg.idOutbox(), msg.bdDestino(), e);
                outboxRepo.markError(msg.idOutbox(), truncar(e.getMessage()));
            }
        }
    }

    private void upsert(OutboxMessage msg) {
        Map<String, Object> data = parsePayload(msg.payload());
        String destino = normalizar(msg.bdDestino());
        if (DESTINO_CASTILLONV2.equalsIgnoreCase(destino)) {
            upsertCastillonV2(data);
        } else {
            upsertVeterinaria(data);
        }
    }

    private void delete(OutboxMessage msg) {
        Map<String, Object> data = parsePayload(msg.payload());
        String nombre = text(data.get("nomProducto"));
        String destino = normalizar(msg.bdDestino());
        JdbcTemplate target = DESTINO_CASTILLONV2.equalsIgnoreCase(destino) ? castillonv2 : veterinaria;
        target.update("UPDATE PRODUCTO SET ESTADO = '0' WHERE NOMPRODUCTO = ? AND ESTADO <> '0'", nombre);
    }

    // ---------------------------------------------------------------
    // BD_CASTILLON_VETERINARIA
    // ---------------------------------------------------------------
    private void upsertVeterinaria(Map<String, Object> data) {
        String nombre = text(data.get("nomProducto"));
        BigDecimal precio = toBigDecimal(data.get("precioUnitario"));
        int affected = veterinaria.update(
                "UPDATE PRODUCTO SET DESCRIPCION = ?, PRECIO_UNITARIO = ?, STOCK_ACTUAL = ?, " +
                "USUMOD = 'sync', FECMOD = GETDATE() WHERE NOMPRODUCTO = ? AND ESTADO = '1'",
                text(data.get("descripcion")), precio, toInt(data.get("stockActual")), nombre
        );
        if (affected == 0) {
            veterinaria.update(
                    "INSERT INTO PRODUCTO (NOMPRODUCTO, DESCRIPCION, PRECIO_UNITARIO, STOCK_ACTUAL, " +
                    "ESTADO, USUCRE, PCCRE, FECCRE) VALUES (?, ?, ?, ?, '1', 'sync', 'SYNC', GETDATE())",
                    nombre, text(data.get("descripcion")), precio, toInt(data.get("stockActual"))
            );
        }
    }

    // ---------------------------------------------------------------
    // CASTILLONV2
    // ---------------------------------------------------------------
    private void upsertCastillonV2(Map<String, Object> data) {
        String nombre = text(data.get("nomProducto"));
        BigDecimal precio = toBigDecimal(data.get("precioUnitario"));
        int affected = castillonv2.update(
                "UPDATE PRODUCTO SET DESCRIPCION = ?, PRECIO = ?, MARCA = ? WHERE NOMPRODUCTO = ? AND ESTADO = '1'",
                text(data.get("descripcion")), precio, text(data.get("marca")), nombre
        );
        if (affected == 0) {
            castillonv2.update(
                    "INSERT INTO PRODUCTO (NOMPRODUCTO, DESCRIPCION, PRECIO, MARCA, ESTADO) " +
                    "VALUES (?, ?, ?, ?, '1')",
                    nombre, text(data.get("descripcion")), precio, text(data.get("marca"))
            );
        }
    }

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------
    private Map<String, Object> parsePayload(String payload) {
        try {
            return objectMapper.readValue(payload, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return Map.of("nomProducto", payload);
        }
    }

    private static String normalizar(String bdDestino) {
        return bdDestino == null ? DESTINO_VETERINARIA : bdDestino.trim();
    }

    private static String text(Object value) {
        return value == null ? "" : value.toString();
    }

    private static int toInt(Object value) {
        if (value instanceof Number n) return n.intValue();
        try {
            return value == null ? 0 : Integer.parseInt(value.toString().trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        try {
            return new BigDecimal(value.toString().trim());
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }

    private String truncar(String msg) {
        return msg != null && msg.length() > 500 ? msg.substring(0, 500) : msg;
    }
}
