# DIAGNÓSTICO INTEGRAL — Sistema Consolidado Veterinaria Castillón

**Fecha del diagnóstico:** 2026-07-21
**Ruta analizada:** `C:\Users\PC\Documents\GitHub\veterinaria_castillon\veterinaria-inteligencia-de-negocios-main\veterinaria-inteligencia-de-negocios-main\`
**Dumps SQL integrados:**
- `C:\Users\PC\Downloads\CASTILLONV2 (1).sql`
- `C:\Users\PC\Downloads\BD_CASTILLON_VETERINARIA (1).sql`
- `C:\Users\PC\Downloads\BD_CONSOLIDAD (1).sql`

---

## 0. ACTUALIZACIÓN — Refactor backend 3 BDs (2026-07-21)

> El diagnóstico de las secciones 1–9 describe el **estado original**. El backend fue
> refactorizado y **verificado en ejecución** contra las 3 BDs reales. Resumen del estado actual:

**Nivel de madurez del backend: 🟢 OPERATIVO (verificado en ejecución).**

Verificación end-to-end (2026-07-21): `mvn clean package` → BUILD SUCCESS; backend arranca y
conecta a SQL Server (localhost:1433); login `admin/admin123` → JWT ADMIN; `GET /api/consolidado/productos`
→ 324; `GET /api/consolidado/clientes` → 2320; `POST /api/consolidado/importar` consolidó las 3 BDs
(productos: vet 100 + v2 70; clientes: vet 200 + v2 120). CASTILLONV2 ya aparece en el consolidado.

| Hallazgo original | Estado |
|---|---|
| C1 — CASTILLONV2 no integrado | ✅ Resuelto: datasource + repos de fuente + ETL `/api/consolidado/importar` + sync reverso |
| Rúbrica — 4 fuentes (rúbrica BI 10.1/10.2) | ✅ Las 4 cableadas al ETL: BD_CASTILLON_VETERINARIA, CASTILLONV2, SamarImportadora (OLTP), DW_SamarImportadora (DW). Restauradas desde `.bak`. ETL verificado: productos vet 100 + v2 70 + samar 77; clientes vet 200 + v2 120 + samar 1000 + dw 1000 |
| Rúbrica — Power BI (10.3) | 🟡 Endpoint `GET /api/consolidado/powerbi` (4 links configurables por entorno); faltan las URLs reales de los `.pbix` publicados |
| Rúbrica — HTML con IA (10.4) | ✅ Panel "Análisis IA" en `/consolidado` (insights en lenguaje natural + distribución por fuente) sobre `GET /api/consolidado/estadisticas` |
| Frontend — consola BI + rol USER solo lectura | ✅ `/consolidado` (KPIs, productos, clientes paginados, Análisis IA, Power BI); USER solo lectura (403 en escritura) |
| Encoding/mojibake en datos | ✅ Corregido: dumps recargados con `sqlcmd -f 65001` (UTF-8); verificado por bytes que la API responde UTF-8 correcto |
| C2 / I6 — `VERSION` faltante en el dump | ✅ Resuelto: `sql-init/migracion-dump.sql` agrega la columna (idempotente) |
| C3 — filtro `ESTADO='A'` vs dump `'1'` | ✅ Resuelto: filtro tolerante (activo = no inactivo) |
| C4 / C5 — `OUTBOX` / `USUARIO` ausentes en el dump | ✅ Resuelto: creadas por `migracion-dump.sql` |
| C6 — sync usaba columna `CODIGO` inexistente | ✅ Resuelto: `SyncService` enruta por `BD_DESTINO` con esquema real |
| C7 — endpoints `/hash` y `/verify` públicos | ✅ Resuelto: eliminados |
| C8 / C9 / I2 — secretos y host/puerto hardcodeados | ✅ Resuelto: externalizados con `${ENV:default}` |
| I1 / F10 — `CLIENTE_CONSOLIDADO` sin API | ✅ Resuelto: `GET /api/consolidado/clientes` (paginado) + ETL de clientes |
| I5 / F7 / F8 — tipos de stock/costo | ✅ Resuelto: parseo numérico seguro en `ProductoResponse` |
| I8 — `GlobalExceptionHandler` sin guarda | ✅ Resuelto |
| I4 / F4 — naming de mascotas | ✅ Resuelto: campo `dueno` completo, sin NPE de `Map.of` |
| I11 — volumen huérfano en compose | ✅ Resuelto |
| M1 — `USUCRE='admin'` hardcodeado | ✅ Resuelto: usa el `Principal` |
| I3 — `AdminProductoController` sin outbox | 🟡 Por diseño (ETL forward bajo demanda); pendiente si se quiere outbox-para-todo |
| Frontend (F1–F9, secciones 5–6) | ⏳ Pendiente (fuera del alcance "backend primero") |

**Orquestación SQL** (ver `sql-init/README.md`): crear BDs → 3 dumps → `migracion-dump.sql`.
La instancia de despliegue verificada fue la default local (`localhost`, TCP 1433); `application.properties`
apunta ahí por defecto y es configurable por entorno.

---

## 1. Resumen ejecutivo

El proyecto es un **orquestador CRUD consolidado** para múltiples bases veterinarias/comerciales, compuesto por:

- **Backend:** Spring Boot 4.1.0 (Java 21), JDBC directo (sin JPA), SQL Server, JWT + BCrypt, patrón Outbox con polling asíncrono.
- **Frontend:** React 19 + Vite 6, TanStack Query, React Router 7, TailwindCSS 4, GSAP, Sonner (toasts), Axios.
- **Persistencia:** 3 bases SQL Server (`BD_CONSOLIDADO`, `BD_CASTILLON_VETERINARIA`, `CASTILLONV2`).
- **Despliegue:** Docker Compose (backend + frontend); el motor SQL Server se asume ya corriendo en el host (puerto `64419`).

### Nivel de madurez global: 🟡 MEDIO
Funciona el flujo de login + CRUD sobre `BD_CASTILLON_VETERINARIA`, pero **la integración real con las 3 BDs es parcial**: `CASTILLONV2` **no se usa** desde el backend, el `PRODUCTO_CONSOLIDADO` real del dump difiere del esquema del código (no tiene `VERSION`), y `CLIENTE_CONSOLIDADO` no se expone en API alguna.

---

## 2. Inventario estructural del proyecto

```
├─ backend/                  (Spring Boot 4.1.0, Java 21)
│  ├─ pom.xml
│  ├─ Dockerfile             (multi-stage maven + JRE Alpine)
│  └─ src/main/java/com/consolidado/
│     ├─ ConsolidadoApplication.java
│     ├─ auth/               (AuthController, AuthService)
│     ├─ config/             (DataSourceConfig, SecurityConfig)
│     ├─ controller/         (AdminProductoController, CatalogoController, HealthController)
│     ├─ dto/                (LoginRequest/Response, ProductoRequest/Response)
│     ├─ exception/          (GlobalExceptionHandler)
│     ├─ outbox/             (OutboxMessage, OutboxRepository)
│     ├─ producto/           (ProductoController/Service/Repository, OptimisticLockException)
│     ├─ security/           (JwtAuthFilter, JwtService)
│     └─ sync/               (OutboxPollingService, SyncService)
│
├─ frontend/                 (React 19 + Vite 6)
│  ├─ src/App.jsx            (Rutas: /, /login, /dashboard, /catalog, /mascotas, etc.)
│  ├─ src/services/api.js    (Axios con JWT interceptor y auto-logout 401)
│  ├─ src/context/           (AuthContext, CartContext)
│  ├─ src/pages/             (Login, Dashboard, Catalog, CatalogMascotas, Inicio, Contacto, ...)
│  └─ src/components/        (ProductCard, ProductForm, CartDrawer, Layout, PublicLayout, ...)
│
├─ sql-init/                 (init.sql, fix-tables.sql, fix-passwords.sql, update-pass.sql, RunSql.exe)
├─ docs/agents/              (domain.md, issue-tracker.md, triage-labels.md)
├─ docker-compose.yml
├─ CLAUDE.md / CONTEXT.md / README.md
└─ BASES DE DATOS COMPLETAS.sql   (⚠ ARCHIVO VACÍO, 0 bytes)
```

---

## 3. Análisis de las 3 bases de datos

### 3.1 `BD_CASTILLON_VETERINARIA` (transaccional real — 1.75 MB, 55 tablas)

Base **completa** de una clínica veterinaria, con módulos:

- **Clínico:** `MASCOTA`, `RAZA`, `ESPECIE`, `FICHA_CLINICA`, `CITA`, `ANALISIS`, `TIPO_ANALISIS`, `PRODUCTO_USADO`.
- **Personas/Empleados:** `PERSONA`, `CLIENTE`, `EMPLEADO`, `EMPRESA`, `PROFESION`, `ESPECIALIDAD`, `PUESTO`, `AREA`, `CONTRATO`, `TIPO_CONTRATO`, `TIPO_PENSION`, `TIPO_SEGURO`.
- **Ubicación:** `DEPARTAMENTO`, `PROVINCIA`, `DISTRITO`.
- **Comercial:** `VENTA`, `BOLETA`, `FACTURA`, `METODO_PAGO`, `PRODUCTO`, `CATEGORIA`, `UNIDAD_MEDIDA`, `ALMACEN`, `AUDITORIA_STOCK`, `MOVIMIENTO_PRODUCTO`, `TIPO_MOVIMIENTO`, `COMPRA`, `DETALLE_COMPRA`, `DETALLE_VENTA`.
- **Caja:** `CAJA`, `APERTURA_CIERRE_CAJA`, `ARQUEO_CAJA`, `MOVIMIENTO_CAJA`, `TIPO_MOVIMIENTO_CAJA`.
- **Promociones:** `PROMOCION`, `TIPO_PROMOCION`, `PROMOCION_PRODUCTO`, `CLIENTE_PROMOCION`.
- **Seguridad:** `USUARIO`, `ROL`, `USUARIO_ROL`, `MODULO`, `PERMISO`, `PERMISO_MODULO`, `ROL_PERMISO_MODULO`, `TIPO_ACCESO`.

**Schema real de `PRODUCTO`** (usado por el backend):
```
IDPRODUCTO, IDUNIDAD_MEDIDA, IDCATEGORIA, NOMPRODUCTO (varchar 100), DESCRIPCION (nvarchar 250),
PRECIO_UNITARIO (decimal 6,2), STOCK_ACTUAL (int), USUCRE, PCCRE, FECCRE, USUMOD, PCMOD, FECMOD, ESTADO (char 1)
```

**Schema real de `PERSONA`** (usado por catálogo de mascotas):
```
IDPERSONA, IDDISTRITO, NOMBRE (varchar 30), APE_PATERNO, APE_MATERNO, FECHNAC, DIRECCION, DNI, GENERO, CELULAR, CORREO, EST_CIVIL, USUCRE...
```

**Schema real de `MASCOTA`**:
```
IDMASCOTA, IDRAZA, IDPERSONA, GENERO (char 1), COLOR (varchar 20), FECHNAC (date),
PESO (decimal 6,2), FOTO (image), USUCRE, ..., ESTADO
```

### 3.2 `CASTILLONV2` (transaccional — 300 KB, 25 tablas)

**⚠ HALLAZGO CLAVE:** A pesar del nombre, `CASTILLONV2` **NO es una versión evolucionada de la BD veterinaria**: es un sistema de **restaurante/comedor**. Contiene tablas como `MESAS`, `PEDIDOS`, `DETALLE_PEDIDO`, `AREA` con valores `Cocina`, `Bar`, `Comedor`, `Servicio Higiénico`.

Tablas: `AREA`, `BANCO`, `BOLETA`, `CARGO`, `CATEGORIA`, `CLIENTE`, `CONTRATO`, `DEPARTAMENTO`, `DETALLE_PEDIDO`, `DEUDA_GENERADA`, `DISTRITO`, `EGRESO`, `EMPLEADO`, `EMPRESA`, `FACTURA`, `INGRESO`, `MESAS`, `METODO_PAGO`, `PEDIDOS`, `PERSONA`, `PRODUCTO`, `PROVINCIA`, `TIPO_USUARIO`, `USUARIO`, `VENTAS`.

**Schema de `PRODUCTO` en CASTILLONV2** (más simple):
```
IDPRODUCTO, IDCATEGORIA, NOMPRODUCTO (nvarchar 100), DESCRIPCION, PRECIO (decimal 6,2), MARCA (nvarchar 50), ESTADO
```

Nota: **no tiene** `PRECIO_UNITARIO`, `STOCK_ACTUAL`, `IDUNIDAD_MEDIDA` ni auditoría (`USUCRE/FECCRE`).

**`PERSONA` de CASTILLONV2** usa `NOMBRES/APEPATERNO/APEMATERNO` (con S), distinto de `NOMBRE/APE_PATERNO/APE_MATERNO` en `BD_CASTILLON_VETERINARIA`.

### 3.3 `BD_CONSOLIDAD(O)` (base central agregada — 960 KB, 2 tablas)

Contiene solo:

| Tabla | Filas dump | Uso |
|-------|-----------|-----|
| `CLIENTE_CONSOLIDADO` | **2 322** | Cargada; **NO se expone** en ninguna API |
| `PRODUCTO_CONSOLIDADO` | **326** | Cargada; usada por `ProductoController` |

**Schema `PRODUCTO_CONSOLIDADO` en el dump real:**
```sql
ID_REGISTRO PK, ID_PRODUCTO varchar(30), NOMPRODUCTO, DESCRIPCION, CATEGORIA,
PRECIO_UNITARIO decimal(10,2), COSTO_UNITARIO varchar(20), STOCK_ACTUAL varchar(20),
MARCA varchar(50), BD_ORIGEN nvarchar(50), FECH_CARGA datetime,
USUCRE, PCCRE, FECCRE, USUMOD, PCMOD, FECMOD, ESTADO varchar(20)
```

**Schema `PRODUCTO_CONSOLIDADO` esperado por `sql-init/init.sql`:**
```sql
... + VERSION INT NOT NULL DEFAULT 0
```

Se cargan datos de dos orígenes: `BD_CASTILLON_VETERINARIA` y `DW_SamarImportadora`.

---

## 4. Diagnóstico de integración BD ↔ Backend

### 4.1 Configuración de datasources

`DataSourceConfig.java` define **solo 2 beans**: `consolidadoDataSource` y `veterinariaDataSource`. No existe bean para `CASTILLONV2`.

`application.properties` / `application-docker.properties`:
- ✅ `BD_CONSOLIDADO` — usado por `AuthService`, `OutboxRepository`, `ProductoRepository`.
- ✅ `BD_CASTILLON_VETERINARIA` — usado por `AdminProductoController`, `CatalogoController`, `SyncService`.
- ❌ `CASTILLONV2` — **NO configurado**, NO conectado, NO consumido.

### 4.2 Hallazgos críticos 🔴

| # | Hallazgo | Ubicación | Impacto |
|---|----------|-----------|---------|
| C1 | `CASTILLONV2` no se integra pese a ser BD de origen documentada | `DataSourceConfig.java`, `application*.properties` | El "consolidado multi-fuente" no consolida esta fuente. Documento `CONTEXT.md` la menciona pero el código la ignora. |
| C2 | Esquema real de `PRODUCTO_CONSOLIDADO` **no tiene columna `VERSION`** | dump `BD_CONSOLIDAD (1).sql` vs `sql-init/init.sql` + `ProductoRepository` | Todas las queries que hacen `VERSION = VERSION + 1` fallarán con `Invalid column name 'VERSION'` en BDs restauradas desde el dump. La estrategia optimistic-lock queda rota. |
| C3 | `PRODUCTO_CONSOLIDADO` del dump **no tiene columna `ESTADO='A'`** consistente con el código | `ProductoRepository.findAll()` filtra `WHERE ESTADO='A'` pero los registros del dump traen `ESTADO=NULL` | El endpoint `/api/consolidado/productos` devolverá **lista vacía** contra el dump real. |
| C4 | Tabla `OUTBOX` no existe en el dump `BD_CONSOLIDAD` | dump vs `init.sql` | Sin re-ejecutar `sql-init/init.sql`, el `OutboxPollingService` truena en cada tick (cada 5 s). |
| C5 | Tabla `USUARIO` no existe en el dump `BD_CONSOLIDAD` | dump vs `init.sql` | El login falla completamente contra un restore del dump. |
| C6 | `SyncService.handleCreate/Update` inserta en `PRODUCTO` usando columna `CODIGO` inexistente | `SyncService.java:48-64` | La sincronización outbox → `BD_CASTILLON_VETERINARIA.PRODUCTO` fallará: la tabla real usa `IDPRODUCTO`/`NOMPRODUCTO` como clave, **no** `CODIGO`. Cada mensaje quedará en `ERROR_SYNC`. |
| C7 | `AuthController` expone `/api/auth/hash` y `/api/auth/verify` públicos | `AuthController.java:27-35`, `SecurityConfig.java:33` | Endpoints permiten a cualquiera generar/verificar hashes BCrypt — filtración funcional interna. Debería estar protegido o eliminado en producción. |
| C8 | `jwt.secret` hardcodeado y commiteado en ambos `application.properties` | `application*.properties` | Secreto JWT expuesto en el repo → cualquiera puede forjar tokens. |
| C9 | Contraseñas `sa=Castillon@2025` hardcodeadas en `docker-compose.yml`, `.env.example` y properties | Multi | Credenciales SQL Server públicas en el repo. |

### 4.3 Hallazgos importantes 🟠

| # | Hallazgo | Ubicación | Impacto |
|---|----------|-----------|---------|
| I1 | `CLIENTE_CONSOLIDADO` (2 322 filas) no se expone en ninguna API | Backend | Datos consolidados sin explotación → sistema no cumple con parte de su propósito. |
| I2 | Puerto SQL Server hardcodeado `64419` en `docker-compose.yml` y `application-docker.properties` | Config | Frágil ante cambios de configuración de SQL Server; asume que host lo publica en ese puerto. |
| I3 | `AdminProductoController` opera sobre `veterinariaJdbcTemplate` con INSERTs en `BD_CASTILLON_VETERINARIA.PRODUCTO` **sin pasar por el outbox** | `AdminProductoController.java` | Se rompe el patrón outbox: hay **dos caminos** de escritura (uno directo, uno via `ProductoService` → outbox), lo que genera divergencia entre `PRODUCTO_CONSOLIDADO` y `BD_CASTILLON_VETERINARIA.PRODUCTO`. |
| I4 | `CatalogoController.listarMascotas` mezcla `NOMBRE + APE_PATERNO` del dueño en la clave "nombre" de la mascota | `CatalogoController.java:57-60` | La UI `CatalogMascotas.jsx` etiqueta ese campo como "Dueño" pero llega concatenado sin el `APE_MATERNO` ni el nombre de la mascota misma (la BD no tiene columna `NOMBRE` de mascota). |
| I5 | `ProductoRepository.mapRow` lee `STOCK_ACTUAL`/`COSTO_UNITARIO` como `String` | `ProductoRepository.java:96-99` | Divergencia de tipos: dump usa `varchar(20)`, código Java trata como String, DTO `ProductoResponse` expone String — pero el frontend luego llama `p.stockActual > 10`, que **compara string** ("9" > "10" == true). |
| I6 | `init.sql` no coincide con dump: crea `PRODUCTO_CONSOLIDADO` con `VERSION`/`ESTADO DEFAULT 'A'`, dump no los tiene | `sql-init/init.sql` vs dump | Si el usuario ejecuta el dump y luego el `init.sql`, el `IF OBJECT_ID IS NULL` **no re-crea la tabla**, por lo que `VERSION` sigue faltando. |
| I7 | `ProductoRepository.findIdByExactMatch` filtra por `ID_PRODUCTO` que en muchos casos es NULL | `ProductoRepository.java:51-59` | Tras crear un producto sin `ID_PRODUCTO`, no se puede recuperar → excepción "Error al obtener ID del producto creado". |
| I8 | `GlobalExceptionHandler.handleValidation` accede a `getFieldErrors().get(0)` sin verificar tamaño | `GlobalExceptionHandler.java:17` | `IndexOutOfBoundsException` si el error es a nivel objeto o global. |
| I9 | `JwtAuthFilter` responde 401 y hace `return` para tokens inválidos, pero no filtra `Authorization` ausente ni endpoints públicos | `JwtAuthFilter.java` | Correcto para request autenticado inválido, pero deja pasar tokens con formato `Bearer <basura>` que no lanzan excepción parseable — a validar. |
| I10 | `docker-compose.yml` no define servicio SQL Server; asume `host.docker.internal` | `docker-compose.yml` | Documentación en `README.md` dice "docker-compose up --build" será suficiente, pero **NO** lo es sin SQL Server previo. |
| I11 | `docker-compose.yml` declara volumen `sqlserver-data` que **no se usa** | Config | Restos de una versión anterior; debe removerse. |
| I12 | Archivo `BASES DE DATOS COMPLETAS.sql` está vacío (0 bytes) | Root | Ruido en el repo. |

### 4.4 Hallazgos menores 🟡

| # | Hallazgo | Ubicación |
|---|----------|-----------|
| M1 | `AdminProductoController` hardcodea `USUCRE='admin'`, `PCCRE='PC01'` en vez de tomar del contexto de seguridad | `AdminProductoController.java:71-100` |
| M2 | `CatalogoController` filtra `WHERE M.ESTADO='1'` pero mezcla con estados `NULL` en algunos registros del dump | `CatalogoController.java:56` |
| M3 | `Dashboard.jsx` invalida query key `['admin-productos']` que **nunca se registra**; la query real es `['productos', isAdmin]` | `Dashboard.jsx:93,103` |
| M4 | `Dashboard.jsx` no envía header `X-Version` en `PUT`, pero backend lo exige `@RequestHeader("X-Version")` | `Dashboard.jsx:91` vs `ProductoController.java:47` |
| M5 | Ruta `/api/admin/productos` en el UI usa el `veterinariaJdbcTemplate` (BD origen), no el `PRODUCTO_CONSOLIDADO` | Divergencia con el modelo consolidado documentado |
| M6 | `ProductoService.buscarPorId` y `listarTodos` marcados `@Transactional` implícitos, pero solo mutaciones lo necesitan realmente | Menor |
| M7 | `useAuth` no expone `logout` desde `Layout` (a verificar en `Layout.jsx`) | Menor |
| M8 | `frontend/Dockerfile` corre `npm run dev` en contenedor (no build de producción), aceptable en dev pero no apto para prod | `frontend/Dockerfile` |
| M9 | `RunSql.exe` binario committeado en `sql-init/` — no es buena práctica versionar ejecutables | `sql-init/RunSql.exe` |
| M10 | En `CatalogoController.listarMascotas` se usa `Map.of(...)` con 8 pares → recomendado `Map.ofEntries` para claridad | Estilo |
| M11 | `.env.example` solo tiene `SPRING_DATASOURCE_PASSWORD` y `MSSQL_SA_PASSWORD`, no cubre `jwt.secret` | Config |
| M12 | `skills-lock.json` (5.5 KB) presente sin explicación en `CLAUDE.md` | Root |

---

## 5. Diagnóstico Frontend

### 5.1 Fortalezas ✅

- Uso correcto de **TanStack Query** para caching de `productos`, `mascotas`, `categorias`, `unidades`.
- Separación de rutas públicas (`/`, `/catalog`, `/mascotas`, `/contacto`, `/sobre-nosotros`) vs. protegidas (`/dashboard`).
- Guardas `ProtectedRoute` y `GuestRoute` con `isExpired` basado en `exp` del JWT.
- Interceptor Axios que agrega `Bearer <token>` y hace logout automático en 401.
- `AuthContext` limpio, persistencia en `localStorage`.
- UI con TailwindCSS 4 y animaciones GSAP.
- Toasts con Sonner para feedback de mutaciones.

### 5.2 Debilidades 🟠

| # | Hallazgo | Ubicación |
|---|----------|-----------|
| F1 | Falta enviar `X-Version` al hacer `PUT` de productos → conflict handler del backend nunca disparará; el update queda ambiguo | `Dashboard.jsx:91` |
| F2 | `queryClient.invalidateQueries({ queryKey: ['admin-productos'] })` no invalida nada (query real es `['productos', isAdmin]`) | `Dashboard.jsx:93,103` |
| F3 | `Catalog.jsx` filtra/sortea en cliente: no escala si hay miles de productos (endpoint no acepta filtros server-side) | `Catalog.jsx` |
| F4 | `CatalogMascotas.jsx` etiqueta como "Dueño" un string mezclado; NO se muestra el `nombre` real de la mascota (la BD no lo tiene) | `CatalogMascotas.jsx:73` |
| F5 | El `ProductCard`/`CartDrawer` sugieren carrito de compras pero no hay flujo de checkout ni endpoint de pedido | `components/CartDrawer.jsx`, `ProductCard.jsx` |
| F6 | `decodeToken` en `AuthContext` usa `atob` sin manejar padding base64url; funcional pero frágil | `AuthContext.jsx:8-13` |
| F7 | `p.precioUnitario?.toFixed(2)` en Dashboard fallará si el backend devuelve string (endpoint admin ya devuelve `BigDecimal` correcto, pero endpoint consolidado devuelve String) | `Dashboard.jsx:158` |
| F8 | `p.stockActual > 10` compara con posible string ("9" > "10" == true en JS) | `Dashboard.jsx:160` |
| F9 | Rutas `/catalog` y `/mascotas` no son protegidas, ok; pero `PublicLayout` no las envuelve → falta consistencia visual | `App.jsx:38-39` |
| F10 | Frontend **no consume** `CLIENTE_CONSOLIDADO`; no hay página que muestre los 2 322 clientes agregados | UI |

---

## 6. Diagnóstico DevOps / Deploy

| # | Hallazgo | Severidad |
|---|----------|-----------|
| D1 | `docker-compose up --build` NO alcanza para levantar el sistema (falta SQL Server externo con la instancia SQL2022 en puerto 64419) | 🔴 |
| D2 | Un solo secret `Castillon@2025` en toda la cadena (SQL, JWT no, pero SA sí) | 🔴 |
| D3 | Frontend en `dev` server para "producción" (no `vite build` + nginx) | 🟠 |
| D4 | No hay `.dockerignore` visible → imágenes potencialmente enormes | 🟠 |
| D5 | No hay CI/CD, workflows, ni tests | 🟠 |
| D6 | Solo hay 1 clase de test (`GenHash.java`) — no es un test real | 🟠 |
| D7 | No hay HTTPS ni CORS explícito configurado en Spring | 🟡 |
| D8 | Volumen `sqlserver-data` declarado en compose pero sin servicio que lo use | 🟡 |
| D9 | JDK 21 + Spring Boot **4.1.0** — versión inusualmente reciente; validar compatibilidad de librerías (Boot 4 elimina `spring-boot-starter-web` en favor de `spring-boot-starter-webmvc`, como se usa aquí ✔) | 🟡 |

---

## 7. Priorización de correcciones sugeridas

### 🔴 P0 (bloqueadores; corregir antes de demo)
1. **Alinear esquema real de `PRODUCTO_CONSOLIDADO`**: agregar columna `VERSION INT NOT NULL DEFAULT 0` al dump (o migrar) para desbloquear optimistic locking (C2, I6).
2. **Crear tablas faltantes** `OUTBOX` y `USUARIO` en la BD real (`BD_CONSOLIDADO` del dump no las tiene) → ejecutar `sql-init/init.sql` sobre la BD restaurada (C4, C5).
3. **Rotar y externalizar** `jwt.secret`, contraseña de `sa`, e insertar credenciales BCrypt correctas para `admin`/`user` (C8, C9).
4. **Arreglar `SyncService`**: usar columna `IDPRODUCTO` o `NOMPRODUCTO` como clave, o agregar `CODIGO` al esquema origen (C6).
5. **Eliminar o proteger** endpoints `/api/auth/hash` y `/api/auth/verify` (C7).
6. **Alinear `ESTADO`** entre dump (`NULL` / `'ACTIVO'`) y código (`'A'`) o migrar registros del dump para que el endpoint consolidado devuelva datos (C3).

### 🟠 P1 (funcionalidad principal)
7. Integrar `CASTILLONV2` como tercera fuente (nuevo `DataSource` + repositorio + ruta de sincronización). Definir mapeo `PRODUCTO.PRECIO` → `PRODUCTO_CONSOLIDADO.PRECIO_UNITARIO` (C1).
8. Exponer API para `CLIENTE_CONSOLIDADO` y página en UI (I1, F10).
9. Unificar caminos de escritura: `AdminProductoController` debe ir por `ProductoService` (outbox) en vez de escritura directa a `BD_CASTILLON_VETERINARIA` (I3).
10. Enviar `X-Version` desde `Dashboard.jsx` en PUT y arreglar `invalidateQueries` con la query key real (F1, F2, M3, M4).
11. Corregir tipos de `STOCK_ACTUAL`/`COSTO_UNITARIO` en `ProductoResponse` (BigDecimal/Integer) y comparaciones en UI (I5, F7, F8).
12. Corregir `CatalogoController.listarMascotas`: mostrar nombre del dueño completo con `APE_MATERNO`, incluir campo separado para "dueño" y aclarar en UI que la mascota no tiene nombre en la BD (I4, F4).

### 🟡 P2 (higiene y robustez)
13. Borrar `BASES DE DATOS COMPLETAS.sql` (vacío), `RunSql.exe` (binario) y volumen huérfano (I11, I12, M9).
14. Añadir tests reales (JUnit para backend, Vitest/Playwright para frontend) — hoy solo hay `GenHash.java` que no es un test (D6).
15. Añadir CI (build + tests), Dockerfile multi-stage para frontend con `nginx`, y `.dockerignore` (D3, D4, D5).
16. Reemplazar `USUCRE='admin'` hardcoded en controllers por el `Principal` del `SecurityContext` (M1).
17. Añadir CORS explícito y headers de seguridad en `SecurityConfig` (D7).
18. Homogeneizar naming: en el modelo, "nombre" de mascota vs. "dueño" (I4).
19. Complementar `.env.example` con `JWT_SECRET`, `SQLSERVER_HOST`, `SQLSERVER_PORT` (M11).

---

## 8. Mapa de flujos actuales vs. esperados

### Flujo actual (funciona en happy-path con init.sql corriendo)

```
UI (React) ──► /api/auth/login ──► BD_CONSOLIDADO.USUARIO ──► JWT
UI (Dashboard, admin) ──► /api/admin/productos (GET/POST/PUT/DELETE)
                              └──► BD_CASTILLON_VETERINARIA.PRODUCTO (directo, sin outbox) ❌
UI (Catalog público) ──► /api/catalogo/productos ──► BD_CASTILLON_VETERINARIA.PRODUCTO
UI (Mascotas) ──► /api/catalogo/mascotas ──► BD_CASTILLON_VETERINARIA.MASCOTA
UI (imaginario) ──► /api/consolidado/productos ──► BD_CONSOLIDADO.PRODUCTO_CONSOLIDADO
                              └──► OUTBOX ──► [poller cada 5s] ──► BD_CASTILLON_VETERINARIA.PRODUCTO ❌ (columna CODIGO no existe)
CASTILLONV2 ──► NADA ❌
CLIENTE_CONSOLIDADO ──► NADA ❌
```

### Flujo esperado según `CONTEXT.md`

```
┌── BD_CASTILLON_VETERINARIA ──┐
├── CASTILLONV2 ───────────────┼──► ETL / Outbox reverso ──► BD_CONSOLIDADO ──► API pública/admin ──► UI
└── DW_SamarImportadora ───────┘
```

Faltan 2 de 3 fuentes conectadas y la publicación de `CLIENTE_CONSOLIDADO`.

---

## 9. Conclusión

El proyecto tiene una **base arquitectónica sólida** (Spring Boot moderno + React 19 + Outbox pattern + JWT) y un modelo de dominio ya identificado en `CONTEXT.md`, pero la **implementación actual solo cubre ~40 %** del enunciado documentado:

- ✅ CRUD de productos en una sola fuente (`BD_CASTILLON_VETERINARIA`).
- ✅ Autenticación JWT + roles ADMIN/USER.
- ✅ Catálogo público de productos y mascotas.
- ⚠ Pattern Outbox: **cableado pero roto** (columna `CODIGO` inexistente + `VERSION` faltante en el dump).
- ❌ Integración `CASTILLONV2`: ausente.
- ❌ `CLIENTE_CONSOLIDADO`: sin API.
- ❌ Seguridad: secretos hardcodeados y endpoints de hashing públicos.

**Recomendación inmediata:** ejecutar el punto 7.1–7.6 (P0) para dejar el sistema **coherente con su propia BD real** antes de agregar features. Con las 6 correcciones P0 el sistema pasa de "funciona solo con init.sql en blanco" a "funciona con las 3 BDs reales importadas".

---

_Diagnóstico generado por análisis estático de código y esquema de las 3 BDs. No se ejecutó el sistema en tiempo real._
