package com.consolidado;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableScheduling
@EnableTransactionManagement
public class ConsolidadoApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConsolidadoApplication.class, args);
    }
}