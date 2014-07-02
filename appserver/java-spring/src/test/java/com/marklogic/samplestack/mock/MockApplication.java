package com.marklogic.samplestack.mock;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.samplestack.impl.CustomObjectMapper;

@Configuration
@ComponentScan(basePackages = {"com.marklogic.samplestack.web", "com.marklogic.samplestack.mock"})
@EnableAutoConfiguration
public class MockApplication {

	private static final Logger logger = LoggerFactory
			.getLogger(MockApplication.class);

	
	public static void main(String[] args) {
		logger.info("Starting Spring Boot SampleStack Application");
		SpringApplication.run(MockApplication.class, args);
	}

	@Bean
	public ObjectMapper mapper() {
		return new CustomObjectMapper();
	}
}
