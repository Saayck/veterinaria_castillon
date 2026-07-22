# Inicialización de las 3 bases de datos

El backend consolidado usa **3 bases SQL Server**:

| Base | Rol | La usa (backend) |
|------|-----|------------------|
| `BD_CASTILLON_VETERINARIA` | Fuente veterinaria | `CatalogoController`, `AdminProductoController`, `VeterinariaFuenteRepository`, `SyncService` |
| `CASTILLONV2` | Fuente restaurante/comercial | `CastillonV2FuenteRepository`, `SyncService` |
| `BD_CONSOLIDADO` | Base central (destino) | `AuthService`, `ProductoRepository`, `ClienteConsolidadoRepository`, `OutboxRepository`, `ImportacionService` |

Hay **dos rutas de inicialización mutuamente excluyentes**. Elige una; **no las mezcles**
(los `CREATE TABLE` de los dumps no están protegidos y chocan con las tablas que crea `init.sql`).

---

## Ruta A — Datos reales (dumps) ← recomendada

Los archivos `BD_CASTILLON_VETERINARIA.sql`, `CASTILLONV2.sql` y `BD_CONSOLIDADO.sql` son dumps
reales. **No crean la base** (empiezan con `USE [...]`) y `BD_CONSOLIDADO.sql` **no trae**
`VERSION`, `OUTBOX` ni `USUARIO`, que el backend necesita. Por eso el orden importa:

1. `00-crear-databases.sql` — crea las 3 bases vacías.
2. `BD_CASTILLON_VETERINARIA.sql` — dump fuente veterinaria.
3. `CASTILLONV2.sql` — dump fuente comercial.
4. `BD_CONSOLIDADO.sql` — dump base central (solo `PRODUCTO_CONSOLIDADO` + `CLIENTE_CONSOLIDADO`).
5. `migracion-dump.sql` — agrega `VERSION` (optimistic lock) y crea `OUTBOX` + `USUARIO` (login).

Automático (requiere `sqlcmd` en el PATH):

```powershell
cd sql-init
.\setup-db.ps1 -Server "localhost,64419" -User sa -Password "TuPassword"
```

Manual (mismo orden):

```powershell
sqlcmd -S localhost,64419 -U sa -P "TuPassword" -i 00-crear-databases.sql
sqlcmd -S localhost,64419 -U sa -P "TuPassword" -i BD_CASTILLON_VETERINARIA.sql
sqlcmd -S localhost,64419 -U sa -P "TuPassword" -i CASTILLONV2.sql
sqlcmd -S localhost,64419 -U sa -P "TuPassword" -i BD_CONSOLIDADO.sql
sqlcmd -S localhost,64419 -U sa -P "TuPassword" -i migracion-dump.sql
```

Después: `POST /api/consolidado/importar` (ADMIN) re-consolida productos y clientes de las 2 fuentes.

---

## Ruta B — Demo sin dumps (`init.sql`)

`init.sql` crea las 3 bases + tablas mínimas (con `VERSION`/`OUTBOX`/`USUARIO` ya incluidos) y
datos de ejemplo. Úsalo **solo** si NO vas a restaurar los dumps.

```powershell
sqlcmd -S localhost,64419 -U sa -P "TuPassword" -i init.sql
```

No ejecutes `migracion-dump.sql` en esta ruta: `init.sql` ya deja el esquema alineado.

---

## Notas

- `migracion-dump.sql` es idempotente: se puede reejecutar sin daño.
- Usuarios sembrados: `admin` / `user`. Rota los hashes en producción
  (ver `update-pass.sql` / `fix-passwords.sql`).
- `RunSql.exe` / `RunSql.cs` son un runner alternativo heredado; `setup-db.ps1` lo reemplaza.
