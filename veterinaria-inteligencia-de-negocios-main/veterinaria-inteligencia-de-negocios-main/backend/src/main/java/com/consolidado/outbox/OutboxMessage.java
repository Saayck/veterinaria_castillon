package com.consolidado.outbox;

public record OutboxMessage(
        long idOutbox,
        String tablaDestino,
        int idRegistro,
        String operacion,
        String payload,
        String bdDestino,
        int intentos
) {}