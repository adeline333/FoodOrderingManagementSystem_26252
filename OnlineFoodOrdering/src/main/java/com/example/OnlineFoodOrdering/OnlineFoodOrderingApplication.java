package com.example.OnlineFoodOrdering;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan("com.example.OnlineFoodOrdering.entity")
@EnableJpaRepositories("com.example.OnlineFoodOrdering.repository")
public class OnlineFoodOrderingApplication {
    public static void main(String[] args) {
        SpringApplication.run(OnlineFoodOrderingApplication.class, args);
    }
}