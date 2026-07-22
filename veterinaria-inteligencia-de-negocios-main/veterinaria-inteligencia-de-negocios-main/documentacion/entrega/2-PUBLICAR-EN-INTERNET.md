# Guía de Despliegue — Sistema Consolidado (BI)

Qué desplegar, **qué archivos de base de datos subir**, y cómo publicarlo **gratis**
para cumplir la rúbrica (10.1: mínimo 2 software hosteados; entregable 5: las 5 BDs).

> ℹ️ Todos los comandos y rutas son **relativos a la raíz del proyecto**
> (la carpeta que contiene `docker-compose.yml`, `sql-init/`, `deploy/`).

---

## 1. Qué compone el sistema

| Componente | Tecnología | Se sube / se hostea |
|---|---|---|
| **Frontend** | React + Vite → nginx (Docker) | ✅ Se expone por link (software hosteado #1) |
| **Backend** | Spring Boot / Java 21 (Docker) | ✅ Se expone por link (software hosteado #2) |
| **Bases de datos (5)** | SQL Server | ✅ **Se entregan como archivos** y se despliegan (local o VM en la nube) |
| **Power BI** | 1 reporte `.pbix` | ✅ Se publica en Power BI Service y se pega el link en la app |

**Las 5 bases:** `BD_CONSOLIDADO`, `BD_CASTILLON_VETERINARIA`, `CASTILLONV2`,
`SamarImportadora`, `DW_SamarImportadora`.

---

## 2. Archivos de base de datos que SÍ o SÍ hay que subir/entregar

Estos archivos reconstruyen las 5 bases con estructura y datos. Van en el `.rar`
(entregable 5) **y** son lo que se sube al servidor donde vivan las BDs:

| Archivo | Base que crea | Ubicación en el repo |
|---|---|---|
| `sql-init/00-crear-databases.sql` | Crea las 3 BDs vacías (paso previo) | ✅ en repo |
| `sql-init/BD_CASTILLON_VETERINARIA.sql` | Dump fuente veterinaria | ✅ en repo |
| `sql-init/CASTILLONV2.sql` | Dump fuente comercial | ✅ en repo |
| `sql-init/BD_CONSOLIDADO.sql` | Dump base central | ✅ en repo |
| `sql-init/migracion-dump.sql` | Agrega VERSION/OUTBOX/USUARIO/CONFIGURACION | ✅ en repo |
| `SamarImportadora.bak` | Base OLTP Samar | ✅ en `sql-init/backups/` |
| `DW_SamarImportadora.bak` | Data Warehouse Samar | ✅ en `sql-init/backups/` |

> Los `.bak` están en `sql-init/backups/` (excluidos de git por su tamaño, pero **incluidos
> en el `.rar`** de entrega).

**Restauración automática:** `sql-init/setup-db.ps1` deja las 5 bases listas de un comando —
crea las 3 BDs de los dumps (UTF-8), restaura los 2 `.bak` y corre `migracion-dump.sql`.
Es **idempotente** (omite las que ya existen); usa `-Fresh` para recargar desde cero.
```powershell
cd sql-init
.\setup-db.ps1 -Server "localhost,1433" -User sa -Password "Castillon@2025"
# recarga limpia:  ... -Fresh
```

---

## 3. Dos estrategias de despliegue (elige una)

### Estrategia A — BDs locales + túnel público (localtunnel)  ← recomendada, gratis, sin dominio
Las 5 BDs y la app corren en **tu equipo**; un túnel les da un **link público** sin abrir
puertos. Cumple 10.1 (link accesible) y mantiene las BDs locales.
**Requiere el equipo encendido durante la revisión.**

> ⚠️ **Ojo con Cloudflare Quick Tunnel (`trycloudflare.com`):** NO sirve para esta app en el
> **navegador** — Cloudflare bloquea con 403 toda petición que lleve el header `Origin` (que el
> navegador siempre manda en el login). Sirve solo desde curl/API. Por eso se usa **localtunnel**.
> Cloudflare sí sirve, pero solo con **Named Tunnel + tu dominio** (§4.1).

### Estrategia B — Todo en la nube (nada local)
BDs en una **VM gratuita**, backend en **Render**, frontend en **Cloudflare Pages**.
No depende de tu equipo, pero requiere más configuración. Ver §5.

---

## 4. Estrategia A — localtunnel (gratis, sin dominio, sin registro)

**URL pública ya configurada:** `https://consolidado-castillon.loca.lt`

1. Base de datos + app en Docker (una vez):
   ```powershell
   cd sql-init
   .\setup-db.ps1 -Server "localhost,1433" -User sa -Password "Castillon@2025"
   cd ..
   docker compose up -d --build
   ```
   Los contenedores tienen `restart: unless-stopped` → reinician solos con Docker.
   El backend ya acepta cualquier origen (CORS `*`) y el frontend manda el header
   `bypass-tunnel-reminder` para saltar el aviso de localtunnel en las llamadas a la API.

2. Levanta el túnel (subdominio fijo, se auto-reinicia si se cae):
   ```powershell
   powershell -ExecutionPolicy Bypass -File deploy\start-tunnel.ps1
   ```
   Deja esa ventana abierta. URL: **https://consolidado-castillon.loca.lt**

3. Para que sobreviva **reinicios** de la PC (dure la semana), instala la tarea programada
   **como Administrador** (una vez):
   ```powershell
   powershell -ExecutionPolicy Bypass -File deploy\install-tunnel-task.ps1
   ```

### Cómo entra el profesor (importante)
1. Abre **https://consolidado-castillon.loca.lt**.
2. La **primera vez** aparece un aviso de localtunnel: **copia el IP** que muestra (hay botón
   de copiar), pégalo en la caja y clic **Continue**. Es **1 sola vez cada 7 días** por visitante.
3. Ya carga la app → inicia sesión con `admin` / `admin123`.

### 4.1 Opción Cloudflare con URL fija (si tienes dominio)
Un *Named Tunnel* de Cloudflare sí funciona en navegador y da URL fija, pero **requiere un
dominio tuyo** agregado a Cloudflare. Pasos: `cloudflared tunnel login/create`, un `config.yml`
   (`cloudflared tunnel login/create/route`) con un `config.yml` que mapee
   `app.tudominio.com → localhost:5173` y `api.tudominio.com → localhost:8080`.

---

## 5. Estrategia B — Todo en la nube (gratis)

### 5.1 Bases de datos → SQL Server en una VM gratuita
Cloudflare/Vercel/Netlify **no hospedan SQL Server**. Opciones gratis reales:

- **Oracle Cloud — Always Free** (recomendada): VM ARM generosa, gratis “para siempre”.
- Google Cloud / AWS free tier (con límites de tiempo).

Pasos en la VM (Ubuntu):
```bash
# 1. SQL Server en Docker
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=TuPassword123!" \
  -p 1433:1433 --name sql -d mcr.microsoft.com/mssql/server:2022-latest

# 2. Sube los archivos de la tabla §2 a la VM (scp/rsync) y restaura:
#    - ejecuta los .sql con sqlcmd (dentro del contenedor o con mssql-tools)
#    - copia los .bak al contenedor y RESTORE DATABASE ... WITH MOVE
# 3. Abre el puerto 1433 en el firewall/Security List de la VM.
```
Alternativa gestionada: **Azure SQL Database (free tier)** — pero **no restaura `.bak`**
directamente; habría que migrar con BACPAC o correr los scripts. Más fricción.

### 5.2 Backend → Render / Railway / Koyeb (free)
Se sube el **código de `backend/`** (ya trae `Dockerfile`).
- Web Service → Docker → root `backend/`.
- Variables de entorno:
  ```
  SPRING_PROFILES_ACTIVE=docker
  SQLSERVER_HOST=<IP pública de la VM>
  SQLSERVER_PORT=1433
  SQLSERVER_USERNAME=sa
  SQLSERVER_PASSWORD=********
  JWT_SECRET=<secreto largo único>
  CORS_ALLOWED_ORIGINS=https://<tu-frontend-en-pages>
  ```

### 5.3 Frontend → Cloudflare Pages (free)
Se sube el **build** (`frontend/dist`).
- Build command `npm run build`, output `dist`.
- Como Pages sirve estático (no proxya `/api`), define la URL del backend: agrega
  `VITE_API_URL=https://<tu-backend>` y en `src/services/api.js` usa
  `baseURL: import.meta.env.VITE_API_URL || ''`. O configura una Pages Function que
  reenvíe `/api/*` al backend.

---

## 6. Power BI (rúbrica 10.3)

1. **Power BI Desktop** → Obtener datos → SQL Server → `BD_CONSOLIDADO` → arma los dashboards
   (2 Producto + 2 Cliente) como **páginas** del mismo reporte.
2. **Publicar en la web (público)** → copia la URL de inserción.
3. En la app (admin) → Consolidado → pestaña **Power BI** → **pega el link** → Guardar.

---

## 7. Checklist final

**Base de datos (siempre):**
- [ ] Los 5 archivos `.sql`/scripts de `sql-init/` incluidos.
- [ ] Los 2 `.bak` copiados a `sql-init/backups/` e incluidos en el `.rar`.
- [ ] BDs restauradas en el servidor elegido (local o VM) con `setup-db.ps1`.

**Estrategia A (local + tunnel):**
- [ ] `.env` con `SQLSERVER_PASSWORD` y `JWT_SECRET`.
- [ ] `docker compose up -d --build` arriba.
- [ ] `cloudflared` → tunnel frontend (link 1) + tunnel backend (link 2).

**Estrategia B (nube):**
- [ ] VM con SQL Server + 5 BDs restauradas + puerto 1433 abierto.
- [ ] Backend en Render con variables de entorno (apuntando a la VM).
- [ ] `frontend/dist` en Cloudflare Pages (+ `VITE_API_URL`, CORS).

**Común:**
- [ ] Reporte Power BI publicado y link pegado en la app.
- [ ] Documento de entrega con: link app, link API, link Power BI y credenciales.

---

## 8. Credenciales de revisión

| Rol | Usuario | Contraseña | Acceso |
|---|---|---|---|
| Admin | `admin` | `admin123` | Total (CRUD, ETL, Power BI, config) |
| Usuario | `user` | `admin123` | Solo lectura |

> Cámbialas antes de la entrega final si el docente lo pide.

---

## 9. Resumen rápido (Estrategia A)

```powershell
# 1. Copiar los .bak al proyecto (para el .rar)
mkdir sql-init\backups
copy C:\Users\Public\sqlbak\*.bak sql-init\backups\

# 2. Restaurar BDs (una vez)
cd sql-init; .\setup-db.ps1 -Server "localhost,1433" -User sa -Password "TuPassword"; cd ..

# 3. Levantar la app
docker compose up -d --build

# 4. Publicar (2 terminales)
cloudflared tunnel --url http://localhost:5173
cloudflared tunnel --url http://localhost:8080
```
