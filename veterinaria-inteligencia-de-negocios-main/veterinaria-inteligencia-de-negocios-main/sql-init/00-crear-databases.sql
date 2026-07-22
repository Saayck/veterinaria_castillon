-- ============================================================
-- PASO 1 - Crea las 3 bases de datos VACIAS.
-- Es OBLIGATORIO ejecutarlo ANTES de los dumps, porque los dumps
-- (BD_CONSOLIDADO.sql, BD_CASTILLON_VETERINARIA.sql, CASTILLONV2.sql)
-- empiezan con "USE [...]" y fallan si la base aun no existe.
-- Idempotente: no recrea una base ya existente.
-- ============================================================

IF DB_ID('BD_CONSOLIDADO')           IS NULL CREATE DATABASE BD_CONSOLIDADO;
IF DB_ID('BD_CASTILLON_VETERINARIA') IS NULL CREATE DATABASE BD_CASTILLON_VETERINARIA;
IF DB_ID('CASTILLONV2')              IS NULL CREATE DATABASE CASTILLONV2;
GO

PRINT 'Bases creadas (o ya existentes). Ahora ejecute los 3 dumps y luego migracion-dump.sql';
GO
