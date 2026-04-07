package com.app.bideo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private static final Path ROOT_UPLOAD_DIR = Paths.get("uploads");
    private static final Path STATIC_UPLOAD_DIR = Paths.get("src", "main", "resources", "static", "uploads");
    private static final Path STATIC_IMAGE_UPLOAD_DIR = Paths.get("src", "main", "resources", "static", "images", "uploads");

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/images/uploads/**")
                .addResourceLocations(
                        STATIC_IMAGE_UPLOAD_DIR.toUri().toString(),
                        ROOT_UPLOAD_DIR.toUri().toString(),
                        STATIC_UPLOAD_DIR.toUri().toString()
                );

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(
                        ROOT_UPLOAD_DIR.toUri().toString(),
                        STATIC_UPLOAD_DIR.toUri().toString(),
                        STATIC_IMAGE_UPLOAD_DIR.toUri().toString()
                );

        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
    }
}
