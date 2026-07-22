package com.consolidado.fuente;

import java.math.BigDecimal;

/**
 * Producto normalizado proveniente de una base de origen (veterinaria, castillonv2, samar...).
 * Es la forma comun que consume el ETL para poblar PRODUCTO_CONSOLIDADO.
 * Los campos que una fuente no tiene (stock, marca, costo) van en null.
 */
public record FuenteProducto(
        String idOrigen,
        String nombre,
        String descripcion,
        String categoria,
        BigDecimal precio,
        BigDecimal costo,
        Integer stock,
        String marca,
        String bdOrigen
) {}
