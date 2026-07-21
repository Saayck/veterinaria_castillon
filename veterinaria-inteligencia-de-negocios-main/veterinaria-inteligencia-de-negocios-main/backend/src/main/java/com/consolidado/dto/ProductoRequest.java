package com.consolidado.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public record ProductoRequest(
        String idProducto,
        @NotBlank(message = "El nombre es obligatorio") String nomProducto,
        String descripcion,
        String categoria,
        @Min(value = 0, message = "El precio debe ser positivo") BigDecimal precioUnitario,
        String costoUnitario,
        String stockActual,
        String bdOrigen
) {}
