package com.marklogic.samplestack.mock;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.samplestack.impl.CustomObjectMapper;

@Configuration
@ComponentScan(basePackages = {"com.marklogic.samplestack.web", "com.marklogic.samplestack.mock"})
@EnableAutoConfiguration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class MockApplication {

	private static final Logger logger = LoggerFactory
			.getLogger(MockApplication.class);

	
	/**
	 * Entry point for the application.
	 * @param args main arguments from the command-line interface.
	 */
	public static void main(String[] args) {
		logger.info("Starting Spring Boot SampleStack Application");
		SpringApplication.run(MockApplication.class, args);
	}

	@Bean
	/**
	 * This method injects a Jackson API ObjectMapper.
	 * When serializing JSON for MarkLogic, this mapper ensures 
	 * that java.util.Date values are serialized such that MarkLogic can index 
	 * them as dateTimes.
	 * @return A customized Jackson ObjectMapper
	 */
	public ObjectMapper mapper() {
		return new CustomObjectMapper();
	}
	

	
	
}
