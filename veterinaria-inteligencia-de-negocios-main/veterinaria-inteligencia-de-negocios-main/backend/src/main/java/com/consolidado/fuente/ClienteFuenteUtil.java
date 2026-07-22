package com.consolidado.fuente;

import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Reglas comunes de normalizacion de clientes al leerlos de las fuentes.
 * Ambas fuentes (veterinaria y castillonv2) modelan CLIENTE -> PERSONA/EMPRESA igual,
 * solo cambian los nombres de columnas de PERSONA.
 */
final class ClienteFuenteUtil {

    private ClienteFuenteUtil() {
    }

    static String apellido(String apePaterno, String apeMaterno) {
        return Stream.of(apePaterno, apeMaterno)
                .filter(s -> s != null && !s.isBlank())
                .collect(Collectors.joining(" "));
    }

    /** Un cliente es EMPRESA si tiene empresa asociada; de lo contrario PERSONA. */
    static String tipoCliente(Integer idEmpresa) {
        return idEmpresa != null ? "EMPRESA" : "PERSONA";
    }

    static String empresa(Integer idEmpresa, String razonSocial) {
        if (idEmpresa != null && razonSocial != null && !razonSocial.isBlank()) {
            return razonSocial.trim();
        }
        return "SIN EMPRESA";
    }
}
