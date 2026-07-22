# Sistema Consolidado — Inteligencia de Negocios (Veterinaria Castillón)

Plataforma que **consolida datos de múltiples fuentes** (Veterinaria, CastillónV2, Samar OLTP y
su Data Warehouse) en una base central, con portal web (React), backend (Spring Boot / Java 21),
proceso **ETL**, análisis con **IA** y **Power BI**.

---

## 📚 Documentación

| Documento | Para qué |
|-----------|----------|
| **[documentacion/entrega/LEEME.md](documentacion/entrega/LEEME.md)** | 👉 **Guía del cliente**: restaurar BDs, levantar la app y entrar (empieza aquí). |
| **[documentacion/entrega/DESPLIEGUE.md](documentacion/entrega/DESPLIEGUE.md)** | Publicar el sistema en internet (túnel / nube). |
| **[documentacion/tecnico/DIAGNOSTICO.md](documentacion/tecnico/DIAGNOSTICO.md)** | Diagnóstico técnico y estado del proyecto. |
| **[CONTEXT.md](CONTEXT.md)** | Modelo de dominio / lenguaje ubicuo. |
| **[sql-init/README.md](sql-init/README.md)** | Detalle de la inicialización de las 5 bases de datos. |

---

## 🚀 Inicio rápido
```bash
# 1) Restaurar las 5 bases (una vez) — ver LEEME.md
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
| Rol | Usuario | Contraseña |
|-----|---------|-----------|
| Admin | `admin` | `admin123` |
| Usuario (solo lectura) | `user` | `admin123` |

## 🗂️ Estructura
```
├─ backend/          Spring Boot (Java 21, JDBC, JWT)
├─ frontend/         React + Vite + Tailwind
├─ sql-init/         Scripts y backups de las 5 bases + setup-db.ps1
├─ deploy/           Scripts del túnel público (Cloudflare/localtunnel)
├─ documentacion/    Guías (entrega, técnico)
└─ docker-compose.yml
```
