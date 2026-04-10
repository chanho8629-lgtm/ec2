package com.app.bideo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path projectRoot = Path.of(System.getProperty("user.dir"));
        String sourceStaticPath = projectRoot.resolve("src").resolve("main").resolve("resources")
                .resolve("static").toUri().toString();
        String buildStaticPath = projectRoot.resolve("build").resolve("resources").resolve("main")
                .resolve("static").toUri().toString();

        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("classpath:/static/uploads/", sourceStaticPath + "uploads/", buildStaticPath + "uploads/");

        registry.addResourceHandler("/images/uploads/**")
                .addResourceLocations("classpath:/static/images/uploads/", sourceStaticPath + "images/uploads/", buildStaticPath + "images/uploads/");
    }
}
