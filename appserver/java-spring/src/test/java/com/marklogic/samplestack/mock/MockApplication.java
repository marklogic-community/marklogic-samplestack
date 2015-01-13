/*
 * Copyright 2012-2015 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/
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
import com.marklogic.samplestack.dbclient.CustomObjectMapper;

@Configuration
@ComponentScan(basePackages = {"com.marklogic.samplestack.web", "com.marklogic.samplestack.mock"})
@EnableAutoConfiguration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
/**
 * A mock of the Application.  Used to short-circuit service implementations such that MarkLogic foibles
 * are taken out of the testing scenario.
 */
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
