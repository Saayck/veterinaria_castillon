package com.consolidado.fuente;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

/**
 * Lectura de PRODUCTO desde CASTILLONV2 (sistema restaurante/comercial), normalizado a
 * {@link FuenteProducto}. Esta base usa PRECIO y MARCA, y no tiene stock ni unidad de medida.
 */
@Repository
public class CastillonV2FuenteRepository {

    public static final String BD_ORIGEN = "CASTILLONV2";

    private final JdbcTemplate jdbc;

    public CastillonV2FuenteRepository(@Qualifier("castillonv2JdbcTemplate") JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<FuenteProducto> listarProductos() {
        return jdbc.query(
                "SELECT P.IDPRODUCTO, P.NOMPRODUCTO, P.DESCRIPCION, C.NOMCATEGORIA AS CATEGORIA, " +
                "P.PRECIO, P.MARCA " +
                "FROM PRODUCTO P LEFT JOIN CATEGORIA C ON P.IDCATEGORIA = C.IDCATEGORIA " +
                "WHERE P.ESTADO = '1'",
                this::mapProducto
        );
    }

    public List<FuenteCliente> listarClientes() {
        return jdbc.query(
                "SELECT C.IDCLIENTE, P.NOMBRES, P.APEPATERNO, P.APEMATERNO, " +
                "E.RAZON_SOCIAL, C.IDEMPRESA " +
                "FROM CLIENTE C " +
                "LEFT JOIN PERSONA P ON C.IDPERSONA = P.IDPERSONA " +
                "LEFT JOIN EMPRESA E ON C.IDEMPRESA = E.IDEMPRESA",
                this::mapCliente
        );
    }

    private FuenteProducto mapProducto(ResultSet rs, int row) throws SQLException {
        return new FuenteProducto(
                String.valueOf(rs.getInt("IDPRODUCTO")),
                rs.getString("NOMPRODUCTO"),
                rs.getString("DESCRIPCION"),
                rs.getString("CATEGORIA"),
                rs.getBigDecimal("PRECIO"),
                null,
                null,
                rs.getString("MARCA"),
                BD_ORIGEN
        );
    }

    private FuenteCliente mapCliente(ResultSet rs, int row) throws SQLException {
        Integer idEmpresa = (Integer) rs.getObject("IDEMPRESA");
        String razonSocial = rs.getString("RAZON_SOCIAL");
        return new FuenteCliente(
                String.valueOf(rs.getInt("IDCLIENTE")),
                rs.getString("NOMBRES"),
                ClienteFuenteUtil.apellido(rs.getString("APEPATERNO"), rs.getString("APEMATERNO")),
                ClienteFuenteUtil.empresa(idEmpresa, razonSocial),
                ClienteFuenteUtil.tipoCliente(idEmpresa),
                BD_ORIGEN
        );
    }
}
