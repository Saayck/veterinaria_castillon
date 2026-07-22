# 📘 LÉEME — Sistema Consolidado (Inteligencia de Negocios)

Guía para **poner el sistema a funcionar desde cero**: restaurar las bases de datos,
levantar la aplicación y entrar. Sigue los pasos en orden.

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
| **Admin** | `admin` | `admin123` | Productos (CRUD), Clientes, Consolidado, ETL, Power BI |
| **Usuario** | `user` | `admin123` | Solo lectura de la consola consolidada |

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

## 5. (Opcional) Publicar el sistema en internet — Cloudflare/túnel
Para que otros entren por un link, ver **`DESPLIEGUE.md`**. Resumen:
```powershell
# deja la app corriendo (docker compose up -d) y ejecuta:
powershell -ExecutionPolicy Bypass -File deploy\start-tunnel.ps1
```
Link público: se genera un `https://...loca.lt`. La PC debe quedar encendida.

---

## Resumen ultra-rápido
```
1) Descomprimir BASE_DE_DATOS.zip -> .\setup-db.ps1 -Server "localhost,1433" -User sa -Password "..."
2) Crear .env  ->  docker compose up -d --build
3) Abrir http://localhost:5173  ->  admin / admin123
```
