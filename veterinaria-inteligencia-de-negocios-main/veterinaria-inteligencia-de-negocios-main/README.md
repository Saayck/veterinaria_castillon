# Sistema Consolidado Veterinario

Sistema CRUD para consolidación de datos veterinarios con backend Java/Spring Boot y frontend React.

## Requisitos
- Docker y Docker Compose instalados.

## Despliegue
1. Copia `.env.example` a `.env` (si necesitas cambiar contraseñas).
2. Ejecuta el sistema:
   ```bash
   docker-compose up --build
   ```
3. Accede al frontend: `http://localhost:5173`
4. Accede al backend (Swagger/Health): `http://localhost:8080`

## Roles
- **Admin**: `admin` / `Castillon@2025`
- **User**: `user` / `Castillon@2025`
