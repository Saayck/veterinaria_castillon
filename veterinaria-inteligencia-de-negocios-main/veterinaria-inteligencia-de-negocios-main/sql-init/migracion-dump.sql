-- ============================================================
-- MIGRACION para bases restauradas desde los dumps reales.
-- Idempotente: se puede ejecutar varias veces sin efectos secundarios.
-- Alinea el esquema del dump con lo que espera el backend consolidado:
--   * PRODUCTO_CONSOLIDADO.VERSION  (Optimistic Locking)  -> el dump NO la trae
--   * Tabla OUTBOX                  (patron Outbox)        -> el dump NO la trae
--   * Tabla USUARIO                 (login JWT)            -> el dump NO la trae
-- Ejecutar sobre BD_CONSOLIDADO despues de restaurar los dumps.
-- ============================================================

USE BD_CONSOLIDADO;
GO

-- ------------------------------------------------------------
-- 1) VERSION en PRODUCTO_CONSOLIDADO (Optimistic Locking)
-- ------------------------------------------------------------
IF COL_LENGTH('dbo.PRODUCTO_CONSOLIDADO', 'VERSION') IS NULL
BEGIN
  ALTER TABLE dbo.PRODUCTO_CONSOLIDADO ADD VERSION INT NOT NULL CONSTRAINT DF_PRODCONS_VERSION DEFAULT 0 WITH VALUES;
  PRINT 'PRODUCTO_CONSOLIDADO.VERSION agregada.';
END
GO

-- MARCA existe en el dump real; se agrega solo por seguridad si faltara.
IF COL_LENGTH('dbo.PRODUCTO_CONSOLIDADO', 'MARCA') IS NULL
BEGIN
  ALTER TABLE dbo.PRODUCTO_CONSOLIDADO ADD MARCA VARCHAR(50) NULL;
  PRINT 'PRODUCTO_CONSOLIDADO.MARCA agregada.';
END
GO

-- ------------------------------------------------------------
-- 2) OUTBOX (mensajeria asincrona, polling UPDLOCK/READPAST)
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.OUTBOX', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.OUTBOX(
    ID_OUTBOX       BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TABLA_DESTINO   VARCHAR(100)  NOT NULL,
    ID_REGISTRO     INT           NOT NULL,
    OPERACION       VARCHAR(10)   NOT NULL,
    PAYLOAD         VARCHAR(MAX)  NULL,
    ESTADO_SYNC     VARCHAR(20)   NOT NULL DEFAULT 'PENDIENTE',
    INTENTOS        INT           NOT NULL DEFAULT 0,
    BD_DESTINO      VARCHAR(100)  NOT NULL,
    FECHA_CREACION  DATETIME      NOT NULL DEFAULT GETDATE(),
    FECHA_PROCESO   DATETIME      NULL,
    MENSAJE_ERROR   VARCHAR(500)  NULL
  );
  CREATE INDEX IX_OUTBOX_ESTADO ON dbo.OUTBOX(ESTADO_SYNC, FECHA_CREACION)
    INCLUDE (ID_REGISTRO, TABLA_DESTINO, PAYLOAD, BD_DESTINO);
  PRINT 'Tabla OUTBOX creada.';
END
GO

-- ------------------------------------------------------------
-- 3) USUARIO (login JWT). Semilla admin/user con BCrypt.
--    Hash de ejemplo corresponde a la contrasena 'admin123'
--    (debe rotarse en produccion).
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.USUARIO', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.USUARIO(
    ID_USUARIO     INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    USERNAME       VARCHAR(50)  NOT NULL UNIQUE,
    PASSWORD_HASH  VARCHAR(255) NOT NULL,
    ROL            VARCHAR(20)  NOT NULL DEFAULT 'USER',
    ESTADO         CHAR(1)      NULL DEFAULT 'A'
  );
  PRINT 'Tabla USUARIO creada.';
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.USUARIO WHERE USERNAME = 'admin')
  INSERT INTO dbo.USUARIO (USERNAME, PASSWORD_HASH, ROL)
  VALUES ('admin', '$2a$10$K.cYJjRBnNYWihyK/IvbyuFjcuk.8.GmcldLNJOoTBN4rDhUmc0ce', 'ADMIN');
GO
IF NOT EXISTS (SELECT 1 FROM dbo.USUARIO WHERE USERNAME = 'user')
  INSERT INTO dbo.USUARIO (USERNAME, PASSWORD_HASH, ROL)
  VALUES ('user', '$2a$10$K.cYJjRBnNYWihyK/IvbyuFjcuk.8.GmcldLNJOoTBN4rDhUmc0ce', 'USER');
GO
-- Operador exclusivo del sistema CASTILLONV2 (password: castillon123)
IF NOT EXISTS (SELECT 1 FROM dbo.USUARIO WHERE USERNAME = 'castillonv2')
  INSERT INTO dbo.USUARIO (USERNAME, PASSWORD_HASH, ROL)
  VALUES ('castillonv2', '$2a$10$hJo/zApYfShcRzaWaJYLLeS1MH6g9b0AhGR3ajQ4s4JM8H.wNxy/6', 'CASTILLONV2');
GO

-- ------------------------------------------------------------
-- 4) CONFIGURACION (clave/valor). Guarda el link del reporte Power BI
--    publicado (un solo hipervinculo que contiene los dashboards por paginas).
-- ------------------------------------------------------------
IF OBJECT_ID('dbo.CONFIGURACION', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.CONFIGURACION(
    CLAVE VARCHAR(50)   NOT NULL PRIMARY KEY,
    VALOR VARCHAR(1000) NULL
  );
  PRINT 'Tabla CONFIGURACION creada.';
END
GO
IF NOT EXISTS (SELECT 1 FROM dbo.CONFIGURACION WHERE CLAVE = 'powerbi_url')
  INSERT INTO dbo.CONFIGURACION (CLAVE, VALOR) VALUES ('powerbi_url', NULL);
GO

PRINT 'Migracion de dumps completada.';
GO
