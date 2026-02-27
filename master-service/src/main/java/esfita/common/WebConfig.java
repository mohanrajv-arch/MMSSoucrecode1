package esfita.common;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		// For screen_image folder
		registry.addResourceHandler("/screen_image/**").addResourceLocations("file:C:/Esfita/Microservices/masters/webapps/Files/screen_image/");

		// For report_image folder
		registry.addResourceHandler("/report_image/**").addResourceLocations("file:C:/Esfita/Microservices/masters/webapps/Files/report_image/");
	}
}
