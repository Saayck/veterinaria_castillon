# Sistema Consolidado — Inteligencia de Negocios (Veterinaria Castillón)

Plataforma que **consolida datos de múltiples fuentes** (Veterinaria, CastillónV2, Samar OLTP y
su Data Warehouse) en una base central, con portal web (React), backend (Spring Boot / Java 21),
proceso **ETL**, análisis con **IA** y **Power BI**.

---

## ⚡ La forma más fácil (2 botones)

Solo necesitas tener instalados: **Docker Desktop** y **SQL Server** (usuario `sa`, puerto 1433).
*(No hace falta abrirlos: los scripts encienden Docker solos.)*

| Doble clic en… | Cuándo | Qué hace |
|---|---|---|
| **`INSTALAR.bat`** | Una sola vez | 👉 TODO: enciende Docker, restaura las 5 bases, configura, levanta la app y abre el navegador. |
| **`ENCENDER.bat`** | Cada día / tras reiniciar | Enciende Docker + app + **link público** + navegador. Deja la ventana abierta. |

Luego entra con **`admin` / `admin123`**. Eso es todo. *(Si prefieres hacerlo a mano, ver la guía 1️⃣ abajo.)*

---

## 📚 Documentación — ¿qué leer?


|   Orden   | Documento                                                                                              | Para qué                                                         |
| :-------: | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| **1️⃣** | **[documentacion/entrega/1-EMPEZAR-AQUI.md](documentacion/entrega/1-EMPEZAR-AQUI.md)**                 | 👉**EMPIEZA AQUÍ**: restaurar las BDs, levantar la app y entrar. |
| **2️⃣** | **[documentacion/entrega/2-PUBLICAR-EN-INTERNET.md](documentacion/entrega/2-PUBLICAR-EN-INTERNET.md)** | (Opcional) publicar el sistema por un link (túnel / nube).       |
|   ℹ️   | **[documentacion/tecnico/DIAGNOSTICO-TECNICO.md](documentacion/tecnico/DIAGNOSTICO-TECNICO.md)**       | Diagnóstico técnico y estado del proyecto (referencia).         |
|   ℹ️   | **[CONTEXT.md](CONTEXT.md)**                                                                           | Modelo de dominio / lenguaje ubicuo (referencia).                 |
|   ℹ️   | **[sql-init/README.md](sql-init/README.md)**                                                           | Detalle de la inicialización de las 5 bases de datos.            |

> 🟢 Si solo vas a **poner el sistema a funcionar**, lee únicamente el
> **[1-EMPEZAR-AQUI.md](documentacion/entrega/1-EMPEZAR-AQUI.md)**.

---

## 🚀 Inicio rápido

```bash
# 1) Restaurar las 5 bases (una vez) — ver 1-EMPEZAR-AQUI.md
cd sql-init
./setup-db.ps1 -Server "localhost,1433" -User sa -Password "TuPassword"
cd ..

# 2) Configurar y levantar
cp .env.example .env        # define SQLSERVER_PASSWORD y JWT_SECRET
docker compose up -d --build
```

- Frontend: `http://localhost:5173`
- Backend:  `http://localhost:8080/api/health`

## 👤 Usuarios


| Rol                    | Usuario | Contraseña | Acceso |
| ---------------------- | ------- | ----------- | ------ |
| Admin                  | `admin` | `admin123`  | Todo (2 sistemas + Consolidado + Power BI) |
| Usuario (solo lectura) | `user`  | `admin123`  | Consola consolidada (solo lectura) |
| Operador CastillónV2   | `castillonv2` | `castillon123` | **Solo** el sistema CastillónV2 (CRUD productos/clientes) |

## 🗂️ Estructura

```
├─ backend/          Spring Boot (Java 21, JDBC, JWT)
├─ frontend/         React + Vite + Tailwind
├─ sql-init/         Scripts y backups de las 5 bases + setup-db.ps1
├─ deploy/           Scripts del túnel público (Cloudflare/localtunnel)
├─ documentacion/    Guías (entrega, técnico)
└─ docker-compose.yml
```
