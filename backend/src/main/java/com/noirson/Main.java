package com.noirson;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

//告知Spring Boot整個應用程式的起點
@SpringBootApplication
public class Main {
    public static void main(String[] args) {
//      啟動Spring Boot
        SpringApplication.run(Main.class, args);
    }
}
