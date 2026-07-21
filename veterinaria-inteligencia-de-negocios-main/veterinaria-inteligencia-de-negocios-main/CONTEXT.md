# Consolidado Multi-Empresa & Veterinaria

Sistema unificado que consolida datos transaccionales de múltiples fuentes (Veterinaria Castillón V1/V2, Samar Importadora, DW Samar Importadora) a través de una base de datos centralizada de consolidación, proporcionando un portal informativo para usuarios comunes y capacidades de modificación/CRUD para administradores autenticados.

## Language

### Consolidación y Origen

**Consolidado**:
La base de datos centralizada que actúa como puente y almacena las entidades unificadas de todas las bases de datos transaccionales de origen.
_Avoid_: Central, base agregada

**Base de Origen (BD_ORIGEN)**:
El identificador del sistema transaccional de donde provienen originalmente los datos de un cliente o producto consolidado (ej. 'BD_CASTILLON_VETERINARIA', 'CASTILLONV2').
_Avoid_: Source database, procedencia

**Producto Consolidado**:
La representación unificada de un medicamento, insumo o artículo proveniente de cualquier base de origen en el consolidado.
_Avoid_: Item consolidado, mercancía consolidada

**Cliente Consolidado**:
La representación unificada de una persona o empresa proveniente de cualquier base de origen en el consolidado.
_Avoid_: Cuenta consolidada, sujeto consolidado

### Veterinaria Castillón (V1 & V2)

**Mascota**:
El animal que recibe atención médica, cirugías o vacunas en las clínicas veterinarias Castillón.
_Avoid_: Paciente, animal, mascota_id

**Propietario (Cliente)**:
La persona o empresa legalmente responsable de la mascota.
_Avoid_: Dueño, cliente_veterinaria

**Ficha Médica**:
El expediente o historial clínico que registra las consultas, vacunas, cirugías o análisis realizados a una mascota.
_Avoid_: Historia, record, ficha

**Caja (Apertura/Cierre)**:
El registro del flujo de efectivo manejado por un usuario en un turno específico para controlar ingresos y egresos de la veterinaria.
_Avoid_: Turno, cash desk

### Samar Importadora (Transaccional & DW)

**Artículo**:
El producto comercial que se importa, almacena en sucursales y se vende a clientes.
_Avoid_: Producto, mercadería

**Sucursal**:
Ubicación física donde se almacena el stock de artículos y se realizan las transacciones de venta.
_Avoid_: Tienda, local

**Hecho de Ventas (Fact_Ventas)**:
La métrica y agregación de rendimiento de ventas registrada en el Data Warehouse (DW) por dimensiones como fecha, sucursal, vendedor y cliente.
_Avoid_: Registro_ventas_dw, tabla_hechos
