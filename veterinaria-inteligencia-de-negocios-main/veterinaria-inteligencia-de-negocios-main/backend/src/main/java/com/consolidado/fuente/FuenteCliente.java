package com.consolidado.fuente;

/**
 * Cliente normalizado proveniente de una base de origen (veterinaria o castillonv2).
 * Forma comun que consume el ETL para poblar CLIENTE_CONSOLIDADO.
 */
public record FuenteCliente(
        String idOrigen,
        String nombre,
        String apellido,
        String empresa,
        String tipoCliente,
        String bdOrigen
) {
    public String nombreCompleto() {
        String n = nombre == null ? "" : nombre.trim();
        String a = apellido == null ? "" : apellido.trim();
        return (n + " " + a).trim();
    }
}
