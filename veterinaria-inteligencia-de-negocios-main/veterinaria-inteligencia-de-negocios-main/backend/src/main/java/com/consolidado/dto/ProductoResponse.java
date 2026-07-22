package com.consolidado.dto;

import java.math.BigDecimal;

public record ProductoResponse(
        Integer idRegistro,
        String idProducto,
        String nomProducto,
        String descripcion,
        String categoria,
        BigDecimal precioUnitario,
        BigDecimal costoUnitario,
        Integer stockActual,
        String marca,
        String estado,
        Integer version,
        String bdOrigen,
        String estadoSync
) {}
