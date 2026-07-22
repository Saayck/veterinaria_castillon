package com.consolidado.cliente;

public record ClienteConsolidadoResponse(
        Integer idRegistro,
        String idCliente,
        String nombre,
        String apellido,
        String nombreCompleto,
        String empresa,
        String tipoCliente,
        String bdOrigen
) {}
