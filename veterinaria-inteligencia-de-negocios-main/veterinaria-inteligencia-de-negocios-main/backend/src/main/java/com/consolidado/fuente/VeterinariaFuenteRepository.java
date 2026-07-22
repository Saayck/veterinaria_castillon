package com.consolidado.fuente;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

/** Lectura de PRODUCTO desde BD_CASTILLON_VETERINARIA, normalizado a {@link FuenteProducto}. */
@Repository
public class VeterinariaFuenteRepository {

    public static final String BD_ORIGEN = "BD_CASTILLON_VETERINARIA";

    private final JdbcTemplate jdbc;

    public VeterinariaFuenteRepository(@Qualifier("veterinariaJdbcTemplate") JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<FuenteProducto> listarProductos() {
        return jdbc.query(
                "SELECT P.IDPRODUCTO, P.NOMPRODUCTO, P.DESCRIPCION, C.NOMCATEGORIA AS CATEGORIA, " +
                "P.PRECIO_UNITARIO, P.STOCK_ACTUAL " +
                "FROM PRODUCTO P LEFT JOIN CATEGORIA C ON P.IDCATEGORIA = C.IDCATEGORIA " +
                "WHERE P.ESTADO = '1'",
                this::mapProducto
        );
    }

    public List<FuenteCliente> listarClientes() {
        return jdbc.query(
                "SELECT C.IDCLIENTE, P.NOMBRE, P.APE_PATERNO, P.APE_MATERNO, " +
                "E.RAZON_SOCIAL, C.IDEMPRESA " +
                "FROM CLIENTE C " +
                "LEFT JOIN PERSONA P ON C.IDPERSONA = P.IDPERSONA " +
                "LEFT JOIN EMPRESA E ON C.IDEMPRESA = E.IDEMPRESA",
                this::mapCliente
        );
    }

    private FuenteProducto mapProducto(ResultSet rs, int row) throws SQLException {
        Object stock = rs.getObject("STOCK_ACTUAL");
        return new FuenteProducto(
                String.valueOf(rs.getInt("IDPRODUCTO")),
                rs.getString("NOMPRODUCTO"),
                rs.getString("DESCRIPCION"),
                rs.getString("CATEGORIA"),
                rs.getBigDecimal("PRECIO_UNITARIO"),
                null,
                stock == null ? null : ((Number) stock).intValue(),
                null,
                BD_ORIGEN
        );
    }

    private FuenteCliente mapCliente(ResultSet rs, int row) throws SQLException {
        Integer idEmpresa = (Integer) rs.getObject("IDEMPRESA");
        String razonSocial = rs.getString("RAZON_SOCIAL");
        return new FuenteCliente(
                String.valueOf(rs.getInt("IDCLIENTE")),
                rs.getString("NOMBRE"),
                ClienteFuenteUtil.apellido(rs.getString("APE_PATERNO"), rs.getString("APE_MATERNO")),
                ClienteFuenteUtil.empresa(idEmpresa, razonSocial),
                ClienteFuenteUtil.tipoCliente(idEmpresa),
                BD_ORIGEN
        );
    }
}
