package com.consolidado.sistema;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

/**
 * CRUD de productos y clientes por sistema operacional.
 * {sistema} = "veterinaria" | "castillonv2". Solo ADMIN.
 */
@RestController
@RequestMapping("/api/sistemas/{sistema}")
@PreAuthorize("hasRole('ADMIN')")
public class SistemaController {

    private final SistemaService service;

    public SistemaController(SistemaService service) {
        this.service = service;
    }

    private static String user(Principal p) {
        return p != null ? p.getName() : "sistema";
    }

    // ---- Productos ----
    @GetMapping("/productos")
    public List<Map<String, Object>> productos(@PathVariable String sistema) {
        return service.listarProductos(sistema);
    }

    @PostMapping("/productos")
    public Map<String, Object> crearProducto(@PathVariable String sistema, @RequestBody Map<String, Object> body, Principal p) {
        service.crearProducto(sistema, body, user(p));
        return Map.of("ok", true);
    }

    @PutMapping("/productos/{id}")
    public Map<String, Object> actualizarProducto(@PathVariable String sistema, @PathVariable int id, @RequestBody Map<String, Object> body, Principal p) {
        service.actualizarProducto(sistema, id, body, user(p));
        return Map.of("ok", true);
    }

    @DeleteMapping("/productos/{id}")
    public Map<String, Object> eliminarProducto(@PathVariable String sistema, @PathVariable int id, Principal p) {
        service.eliminarProducto(sistema, id, user(p));
        return Map.of("ok", true);
    }

    @GetMapping("/categorias")
    public List<Map<String, Object>> categorias(@PathVariable String sistema) {
        return service.listarCategorias(sistema);
    }

    @GetMapping("/unidades")
    public List<Map<String, Object>> unidades(@PathVariable String sistema) {
        return service.listarUnidades(sistema);
    }

    // ---- Clientes ----
    @GetMapping("/clientes")
    public List<Map<String, Object>> clientes(@PathVariable String sistema) {
        return service.listarClientes(sistema);
    }

    @PostMapping("/clientes")
    public Map<String, Object> crearCliente(@PathVariable String sistema, @RequestBody Map<String, Object> body, Principal p) {
        service.crearCliente(sistema, body, user(p));
        return Map.of("ok", true);
    }

    @PutMapping("/clientes/{id}")
    public Map<String, Object> actualizarCliente(@PathVariable String sistema, @PathVariable int id, @RequestBody Map<String, Object> body, Principal p) {
        service.actualizarCliente(sistema, id, body, user(p));
        return Map.of("ok", true);
    }

    @DeleteMapping("/clientes/{id}")
    public Map<String, Object> eliminarCliente(@PathVariable String sistema, @PathVariable int id, Principal p) {
        service.eliminarCliente(sistema, id, user(p));
        return Map.of("ok", true);
    }
}
