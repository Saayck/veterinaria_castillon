package com.consolidado.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;

/**
 * Define las 3 fuentes de datos del sistema consolidado:
 *  - consolidado   -> BD_CONSOLIDADO           (principal: consolidado, outbox, usuarios)
 *  - veterinaria   -> BD_CASTILLON_VETERINARIA (fuente veterinaria)
 *  - castillonv2   -> CASTILLONV2              (fuente restaurante/comercial)
 * Cada una expone su propio {@link JdbcTemplate}; solo la principal tiene TransactionManager
 * porque es la unica que se escribe dentro de transacciones (consolidado + outbox).
 */
@Configuration
public class DataSourceConfig {

    // ---------------------------------------------------------------
    // BD_CONSOLIDADO (principal)
    // ---------------------------------------------------------------
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.consolidado")
    public DataSource consolidadoDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean
    public PlatformTransactionManager consolidadoTransactionManager(
            @Qualifier("consolidadoDataSource") DataSource ds) {
        return new DataSourceTransactionManager(ds);
    }

    @Bean
    public JdbcTemplate consolidadoJdbcTemplate(@Qualifier("consolidadoDataSource") DataSource ds) {
        return new JdbcTemplate(ds);
    }

    // ---------------------------------------------------------------
    // BD_CASTILLON_VETERINARIA (fuente veterinaria)
    // ---------------------------------------------------------------
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.veterinaria")
    public DataSource veterinariaDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean
    public JdbcTemplate veterinariaJdbcTemplate(@Qualifier("veterinariaDataSource") DataSource ds) {
        return new JdbcTemplate(ds);
    }

    // ---------------------------------------------------------------
    // CASTILLONV2 (fuente restaurante/comercial)
    // ---------------------------------------------------------------
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.castillonv2")
    public DataSource castillonv2DataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean
    public JdbcTemplate castillonv2JdbcTemplate(@Qualifier("castillonv2DataSource") DataSource ds) {
        return new JdbcTemplate(ds);
    }

    // ---------------------------------------------------------------
    // SamarImportadora (fuente OLTP)
    // ---------------------------------------------------------------
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.samar")
    public DataSource samarDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean
    public JdbcTemplate samarJdbcTemplate(@Qualifier("samarDataSource") DataSource ds) {
        return new JdbcTemplate(ds);
    }

    // ---------------------------------------------------------------
    // DW_SamarImportadora (fuente Data Warehouse)
    // ---------------------------------------------------------------
    @Bean
    @ConfigurationProperties(prefix = "spring.datasource.dwsamar")
    public DataSource dwsamarDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean
    public JdbcTemplate dwsamarJdbcTemplate(@Qualifier("dwsamarDataSource") DataSource ds) {
        return new JdbcTemplate(ds);
    }

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
