package com.consolidado.sistema;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * CRUD de los 2 sistemas operacionales, cada uno conectado a su propia BD:
 *   - "veterinaria" -> BD_CASTILLON_VETERINARIA (PRODUCTO con unidad/stock; PERSONA NOMBRE/APE_*)
 *   - "castillonv2" -> CASTILLONV2              (PRODUCTO con precio/marca; PERSONA NOMBRES/APE*)
 * Maneja productos y clientes (cliente = PERSONA + CLIENTE). Todo con soft-delete (ESTADO='0').
 */
@Service
public class SistemaService {

    private final JdbcTemplate veterinaria;
    private final JdbcTemplate castillonv2;

    public SistemaService(@Qualifier("veterinariaJdbcTemplate") JdbcTemplate veterinaria,
                          @Qualifier("castillonv2JdbcTemplate") JdbcTemplate castillonv2) {
        this.veterinaria = veterinaria;
        this.castillonv2 = castillonv2;
    }

    private JdbcTemplate db(String sistema) {
        return "castillonv2".equalsIgnoreCase(sistema) ? castillonv2 : veterinaria;
    }
    private boolean isVet(String sistema) {
        return !"castillonv2".equalsIgnoreCase(sistema);
    }

    private static Object str(Map<String, Object> b, String k) {
        Object v = b.get(k);
        return v == null || v.toString().isBlank() ? null : v;
    }

    // ============================ PRODUCTOS ============================

    public List<Map<String, Object>> listarProductos(String sistema) {
        if (isVet(sistema)) {
            return db(sistema).query(
                "SELECT P.IDPRODUCTO, P.NOMPRODUCTO, P.DESCRIPCION, P.IDCATEGORIA, C.NOMCATEGORIA, " +
                "P.IDUNIDAD_MEDIDA, U.NOMUNIDAD_MEDIDA, P.PRECIO_UNITARIO, P.STOCK_ACTUAL, P.ESTADO " +
                "FROM PRODUCTO P LEFT JOIN CATEGORIA C ON P.IDCATEGORIA=C.IDCATEGORIA " +
                "LEFT JOIN UNIDAD_MEDIDA U ON P.IDUNIDAD_MEDIDA=U.IDUNIDAD_MEDIDA ORDER BY P.IDPRODUCTO",
                (rs, r) -> Map.ofEntries(
                    Map.entry("id", rs.getInt("IDPRODUCTO")),
                    Map.entry("nombre", nz(rs.getString("NOMPRODUCTO"))),
                    Map.entry("descripcion", nz(rs.getString("DESCRIPCION"))),
                    Map.entry("idCategoria", rs.getObject("IDCATEGORIA")),
                    Map.entry("categoria", nz(rs.getString("NOMCATEGORIA"))),
                    Map.entry("idUnidad", rs.getObject("IDUNIDAD_MEDIDA")),
                    Map.entry("unidad", nz(rs.getString("NOMUNIDAD_MEDIDA"))),
                    Map.entry("precio", rs.getObject("PRECIO_UNITARIO")),
                    Map.entry("stock", rs.getObject("STOCK_ACTUAL")),
                    Map.entry("marca", ""),
                    Map.entry("estado", nz(rs.getString("ESTADO")))
                ));
        }
        return db(sistema).query(
            "SELECT P.IDPRODUCTO, P.NOMPRODUCTO, P.DESCRIPCION, P.IDCATEGORIA, C.NOMCATEGORIA, " +
            "P.PRECIO, P.MARCA, P.ESTADO FROM PRODUCTO P LEFT JOIN CATEGORIA C ON P.IDCATEGORIA=C.IDCATEGORIA " +
            "ORDER BY P.IDPRODUCTO",
            (rs, r) -> Map.ofEntries(
                Map.entry("id", rs.getInt("IDPRODUCTO")),
                Map.entry("nombre", nz(rs.getString("NOMPRODUCTO"))),
                Map.entry("descripcion", nz(rs.getString("DESCRIPCION"))),
                Map.entry("idCategoria", rs.getObject("IDCATEGORIA")),
                Map.entry("categoria", nz(rs.getString("NOMCATEGORIA"))),
                Map.entry("idUnidad", ""),
                Map.entry("unidad", ""),
                Map.entry("precio", rs.getObject("PRECIO")),
                Map.entry("stock", ""),
                Map.entry("marca", nz(rs.getString("MARCA"))),
                Map.entry("estado", nz(rs.getString("ESTADO")))
            ));
    }

    public void crearProducto(String sistema, Map<String, Object> b, String usuario) {
        if (isVet(sistema)) {
            db(sistema).update(
                "INSERT INTO PRODUCTO (NOMPRODUCTO, DESCRIPCION, IDCATEGORIA, IDUNIDAD_MEDIDA, PRECIO_UNITARIO, " +
                "STOCK_ACTUAL, ESTADO, USUCRE, PCCRE, FECCRE) VALUES (?,?,?,?,?,?, '1', ?, 'PC01', GETDATE())",
                str(b, "nombre"), str(b, "descripcion"), str(b, "idCategoria"), str(b, "idUnidad"),
                str(b, "precio"), str(b, "stock"), usuario);
        } else {
            db(sistema).update(
                "INSERT INTO PRODUCTO (NOMPRODUCTO, DESCRIPCION, IDCATEGORIA, PRECIO, MARCA, ESTADO) " +
                "VALUES (?,?,?,?,?, '1')",
                str(b, "nombre"), str(b, "descripcion"), str(b, "idCategoria"), str(b, "precio"), str(b, "marca"));
        }
    }

    public void actualizarProducto(String sistema, int id, Map<String, Object> b, String usuario) {
        if (isVet(sistema)) {
            db(sistema).update(
                "UPDATE PRODUCTO SET NOMPRODUCTO=?, DESCRIPCION=?, IDCATEGORIA=?, IDUNIDAD_MEDIDA=?, " +
                "PRECIO_UNITARIO=?, STOCK_ACTUAL=?, USUMOD=?, PCMOD='PC01', FECMOD=GETDATE() WHERE IDPRODUCTO=?",
                str(b, "nombre"), str(b, "descripcion"), str(b, "idCategoria"), str(b, "idUnidad"),
                str(b, "precio"), str(b, "stock"), usuario, id);
        } else {
            db(sistema).update(
                "UPDATE PRODUCTO SET NOMPRODUCTO=?, DESCRIPCION=?, IDCATEGORIA=?, PRECIO=?, MARCA=? WHERE IDPRODUCTO=?",
                str(b, "nombre"), str(b, "descripcion"), str(b, "idCategoria"), str(b, "precio"), str(b, "marca"), id);
        }
    }

    public void eliminarProducto(String sistema, int id, String usuario) {
        if (isVet(sistema)) {
            db(sistema).update("UPDATE PRODUCTO SET ESTADO='0', USUMOD=?, FECMOD=GETDATE() WHERE IDPRODUCTO=?", usuario, id);
        } else {
            db(sistema).update("UPDATE PRODUCTO SET ESTADO='0' WHERE IDPRODUCTO=?", id);
        }
    }

    public List<Map<String, Object>> listarCategorias(String sistema) {
        return db(sistema).query(
            "SELECT IDCATEGORIA, NOMCATEGORIA FROM CATEGORIA WHERE ESTADO='1' OR ESTADO IS NULL ORDER BY NOMCATEGORIA",
            (rs, r) -> Map.of("id", rs.getInt("IDCATEGORIA"), "nombre", nz(rs.getString("NOMCATEGORIA"))));
    }

    public List<Map<String, Object>> listarUnidades(String sistema) {
        if (!isVet(sistema)) return List.of();
        return db(sistema).query(
            "SELECT IDUNIDAD_MEDIDA, NOMUNIDAD_MEDIDA FROM UNIDAD_MEDIDA WHERE ESTADO='1' OR ESTADO IS NULL",
            (rs, r) -> Map.of("id", rs.getInt("IDUNIDAD_MEDIDA"), "nombre", nz(rs.getString("NOMUNIDAD_MEDIDA"))));
    }

    // ============================ CLIENTES ============================

    public List<Map<String, Object>> listarClientes(String sistema) {
        String cols = isVet(sistema) ? "P.NOMBRE, P.APE_PATERNO, P.APE_MATERNO"
                                      : "P.NOMBRES AS NOMBRE, P.APEPATERNO AS APE_PATERNO, P.APEMATERNO AS APE_MATERNO";
        return db(sistema).query(
            "SELECT C.IDCLIENTE, " + cols + ", C.ESTADO FROM CLIENTE C " +
            "LEFT JOIN PERSONA P ON C.IDPERSONA=P.IDPERSONA " +
            "WHERE C.ESTADO='1' OR C.ESTADO IS NULL ORDER BY C.IDCLIENTE",
            (rs, r) -> Map.ofEntries(
                Map.entry("id", rs.getInt("IDCLIENTE")),
                Map.entry("nombre", nz(rs.getString("NOMBRE"))),
                Map.entry("apePaterno", nz(rs.getString("APE_PATERNO"))),
                Map.entry("apeMaterno", nz(rs.getString("APE_MATERNO"))),
                Map.entry("estado", nz(rs.getString("ESTADO")))
            ));
    }

    public void crearCliente(String sistema, Map<String, Object> b, String usuario) {
        Integer idPersona;
        if (isVet(sistema)) {
            idPersona = db(sistema).queryForObject(
                "SET NOCOUNT ON; INSERT INTO PERSONA (NOMBRE, APE_PATERNO, APE_MATERNO, ESTADO, USUCRE, PCCRE, FECCRE) " +
                "VALUES (?,?,?, '1', ?, 'PC01', GETDATE()); SELECT CAST(SCOPE_IDENTITY() AS INT);",
                Integer.class, str(b, "nombre"), str(b, "apePaterno"), str(b, "apeMaterno"), usuario);
            db(sistema).update(
                "INSERT INTO CLIENTE (IDPERSONA, ESTADO, USUCRE, PCCRE, FECCRE) VALUES (?, '1', ?, 'PC01', GETDATE())",
                idPersona, usuario);
        } else {
            idPersona = db(sistema).queryForObject(
                "SET NOCOUNT ON; INSERT INTO PERSONA (NOMBRES, APEPATERNO, APEMATERNO, ESTADO) VALUES (?,?,?, '1'); " +
                "SELECT CAST(SCOPE_IDENTITY() AS INT);",
                Integer.class, str(b, "nombre"), str(b, "apePaterno"), str(b, "apeMaterno"));
            db(sistema).update("INSERT INTO CLIENTE (IDPERSONA, ESTADO) VALUES (?, '1')", idPersona);
        }
    }

    public void actualizarCliente(String sistema, int idCliente, Map<String, Object> b, String usuario) {
        Integer idPersona = db(sistema).query(
            "SELECT IDPERSONA FROM CLIENTE WHERE IDCLIENTE=?",
            (rs, r) -> (Integer) rs.getObject("IDPERSONA"), idCliente).stream().findFirst().orElse(null);
        if (idPersona == null) return;
        if (isVet(sistema)) {
            db(sistema).update(
                "UPDATE PERSONA SET NOMBRE=?, APE_PATERNO=?, APE_MATERNO=?, USUMOD=?, PCMOD='PC01', FECMOD=GETDATE() WHERE IDPERSONA=?",
                str(b, "nombre"), str(b, "apePaterno"), str(b, "apeMaterno"), usuario, idPersona);
        } else {
            db(sistema).update(
                "UPDATE PERSONA SET NOMBRES=?, APEPATERNO=?, APEMATERNO=? WHERE IDPERSONA=?",
                str(b, "nombre"), str(b, "apePaterno"), str(b, "apeMaterno"), idPersona);
        }
    }

    public void eliminarCliente(String sistema, int idCliente, String usuario) {
        if (isVet(sistema)) {
            db(sistema).update("UPDATE CLIENTE SET ESTADO='0', USUMOD=?, FECMOD=GETDATE() WHERE IDCLIENTE=?", usuario, idCliente);
        } else {
            db(sistema).update("UPDATE CLIENTE SET ESTADO='0' WHERE IDCLIENTE=?", idCliente);
        }
    }

    private static String nz(String s) {
        return s != null ? s : "";
    }
}
