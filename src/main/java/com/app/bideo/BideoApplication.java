package com.app.bideo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.session.SessionAutoConfiguration;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(exclude = SessionAutoConfiguration.class)
@EnableScheduling
public class BideoApplication {

    public static void main(String[] args) {
        SpringApplication.run(BideoApplication.class, args);
    }
}
