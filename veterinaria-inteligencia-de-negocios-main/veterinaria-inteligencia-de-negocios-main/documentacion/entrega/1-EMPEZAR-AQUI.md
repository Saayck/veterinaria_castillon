# 🚀 EMPEZAR AQUÍ — Sistema Consolidado (Inteligencia de Negocios)

Guía para **poner el sistema a funcionar desde cero**: restaurar las bases de datos,
levantar la aplicación y entrar.

---

## ✅ Opción FÁCIL (recomendada) — un solo clic
1. Ten abierto **Docker Desktop** y tu **SQL Server** corriendo (usuario `sa`, puerto 1433).
2. **Doble clic en `INSTALAR.bat`** (en la carpeta del proyecto).
   - Te pedirá la contraseña de tu SQL Server (Enter para la de por defecto).
   - Hace TODO solo: restaura las 5 bases, configura, levanta la app y abre el navegador.
3. Entra con **`admin` / `admin123`**.

Para reiniciar la app después: doble clic en **`INICIAR-APP.bat`**.
Para generar el link público: doble clic en **`PUBLICAR-LINK.bat`**.

> Si el `INSTALAR.bat` funcionó, **ya terminaste** — no necesitas leer lo de abajo.

---

## 🛠️ Opción MANUAL (paso a paso)
Solo si prefieres hacerlo a mano o el instalador falló.

> ℹ️ Todos los comandos y rutas (`sql-init/`, `deploy/`, `.env`, `docker compose ...`) son
> **relativos a la raíz del proyecto** (la carpeta que contiene `docker-compose.yml`).

---

## 0. Requisitos (instalar una vez)
- **SQL Server** (Express o Developer) corriendo, con **TCP/IP habilitado en el puerto 1433**
  y el usuario **`sa`** activado.
- **sqlcmd** (viene con SQL Server o con "SQL Server Command Line Utilities").
- **Docker Desktop** (para levantar la app). *Alternativa sin Docker: Java 21 + Maven.*

---

## 1. Restaurar las 5 bases de datos
Los archivos están en **`BASE_DE_DATOS.zip`** (o en la carpeta `sql-init/`).

1. Descomprime `BASE_DE_DATOS.zip`.
2. Abre **PowerShell** dentro de esa carpeta y ejecuta (cambia el password por el de tu `sa`):
   ```powershell
   .\setup-db.ps1 -Server "localhost,1433" -User sa -Password "TuPassword"
   ```
   Esto crea/carga las 5 bases: `BD_CONSOLIDADO`, `BD_CASTILLON_VETERINARIA`,
   `CASTILLONV2`, `SamarImportadora`, `DW_SamarImportadora`.
   *(Es idempotente: si una base ya existe, la omite. Para recargar desde cero: agrega `-Fresh`.)*

> Alternativa manual (SSMS): ver `LEEME-RESTAURAR.txt` dentro del ZIP.

---

## 2. Levantar la aplicación (Docker)
Desde la carpeta del proyecto:

1. Crea el archivo `.env` (copia de `.env.example`) y pon tu password de SQL y un `JWT_SECRET`:
   ```
   SQLSERVER_PASSWORD=TuPassword
   JWT_SECRET=un_secreto_largo_de_minimo_32_caracteres
   ```
2. Construye y levanta:
   ```powershell
   docker compose up -d --build
   ```
3. Verifica:
   - App:      http://localhost:5173
   - Backend:  http://localhost:8080/api/health

*(Sin Docker: `cd backend` y `mvn clean package -DskipTests`, luego
`java -jar target/consolidado-backend-0.0.1-SNAPSHOT.jar`; y `cd frontend` + `npm install` + `npm run dev`.)*

---

## 3. Entrar al sistema
Abre **http://localhost:5173** → "Iniciar Sesión".

| Rol | Usuario | Contraseña | Qué puede hacer |
|-----|---------|-----------|-----------------|
| **Admin** | `admin` | `admin123` | Todo: Productos (CRUD), Clientes, Consolidado, ETL, Power BI |
| **Usuario** | `user` | `admin123` | Solo lectura de la consola consolidada |
| **Operador CastillónV2** | `castillonv2` | `castillon123` | **Solo** el sistema CastillónV2 (CRUD de sus productos y clientes) |

También puedes **registrar** un usuario nuevo (rol solo lectura) desde la pantalla de registro.

### Qué hay dentro
- **Productos** y **Clientes**: cada uno con selector de **2 sistemas** (Veterinaria y CastillónV2),
  cada sistema conectado a su propia BD.
- **Consolidado**: KPIs, productos/clientes consolidados, **Análisis IA** y **Power BI**.
- **Consolidar ahora** (admin): corre el ETL que unifica las 4 fuentes en `BD_CONSOLIDADO`.

---

## 4. Power BI
1. En **Power BI Desktop**: conecta a `BD_CONSOLIDADO`, arma el reporte y **Publica en la web**.
2. En la app (admin) → **Consolidado → Power BI** → pega el link → **Guardar**.
3. El dashboard queda embebido para todos.

---

## 5. (Opcional) Publicar el sistema en internet — túnel (localtunnel)
Para que otros entren por un link, ver **`2-PUBLICAR-EN-INTERNET.md`**. Resumen:
```powershell
# deja la app corriendo (docker compose up -d) y ejecuta:
powershell -ExecutionPolicy Bypass -File deploy\start-tunnel.ps1
```
- Link público: **https://consolidado-castillon.loca.lt** (se genera un `.loca.lt`).
- **Primera visita:** aparece una página de aviso de localtunnel → **copia el IP** que muestra
  (botón de copiar), pégalo y clic **Continue**. Es 1 sola vez cada 7 días por visitante.
- La **PC debe quedar encendida** con Docker y el túnel corriendo.

> Nota: el túnel gratis de **Cloudflare** (`trycloudflare.com`) NO sirve en navegador (bloquea el
> login por el header `Origin`); por eso se usa **localtunnel**. Cloudflare sólo funciona con
> *Named Tunnel + dominio propio* (ver `2-PUBLICAR-EN-INTERNET.md`).

---

## Resumen ultra-rápido
```
1) Descomprimir BASE_DE_DATOS.zip -> .\setup-db.ps1 -Server "localhost,1433" -User sa -Password "..."
2) Crear .env  ->  docker compose up -d --build
3) Abrir http://localhost:5173  ->  admin / admin123
```
