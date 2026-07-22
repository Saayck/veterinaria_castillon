package com.consolidado.fuente;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Expone (solo ADMIN) los productos/clientes de cada base de origen, para inspeccionar las
 * fuentes antes/despues de consolidar. La ruta /api/fuentes/** esta restringida en SecurityConfig.
 */
@RestController
@RequestMapping("/api/fuentes")
public class FuenteController {

    private final VeterinariaFuenteRepository veterinaria;
    private final CastillonV2FuenteRepository castillonv2;
    private final SamarFuenteRepository samar;
    private final DwSamarFuenteRepository dwsamar;

    public FuenteController(VeterinariaFuenteRepository veterinaria,
                            CastillonV2FuenteRepository castillonv2,
                            SamarFuenteRepository samar,
                            DwSamarFuenteRepository dwsamar) {
        this.veterinaria = veterinaria;
        this.castillonv2 = castillonv2;
        this.samar = samar;
        this.dwsamar = dwsamar;
    }

    @GetMapping("/veterinaria/productos")
    public List<FuenteProducto> veterinariaProductos() {
        return veterinaria.listarProductos();
    }

    @GetMapping("/castillonv2/productos")
    public List<FuenteProducto> castillonv2Productos() {
        return castillonv2.listarProductos();
    }

    @GetMapping("/samar/productos")
    public List<FuenteProducto> samarProductos() {
        return samar.listarProductos();
    }

    @GetMapping("/samar/clientes")
    public List<FuenteCliente> samarClientes() {
        return samar.listarClientes();
    }

    @GetMapping("/dwsamar/clientes")
    public List<FuenteCliente> dwsamarClientes() {
        return dwsamar.listarClientes();
    }
}
