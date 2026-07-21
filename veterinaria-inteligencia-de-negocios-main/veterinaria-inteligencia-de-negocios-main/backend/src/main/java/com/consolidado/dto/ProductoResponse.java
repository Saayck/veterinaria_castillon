package com.consolidado.dto;

import java.math.BigDecimal;

public record ProductoResponse(
        Integer idRegistro,
        String idProducto,
        String nomProducto,
        String descripcion,
        String categoria,
        BigDecimal precioUnitario,
        String costoUnitario,
        String stockActual,
        String estado,
        Integer version,
        String bdOrigen,
        String estadoSync
) {}
