package com.esfita.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Enable CORS for all endpoints
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")  // all endpoints
                .allowedOrigins("*") // or restrict to your domain
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // For screen_image folder
        registry.addResourceHandler("/screen_image/**")
                .addResourceLocations("file:C:/MMS/Files/screen_image/");
        
        // For report_image folder
        registry.addResourceHandler("/report_image/**")
                .addResourceLocations("file:C:/MMS/Files/report_image/");
    }
}
