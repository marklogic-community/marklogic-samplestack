/*
 * Copyright 2012-2014 MarkLogic Corporation
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
package com.marklogic.samplestack;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan
@EnableAutoConfiguration
/**
 * Top-Level application runner and application context configuration for
 * Samplestack.
 * 
 * Spring boot uses this class's main method to initialize the application.
 */
public class Application {

	private static final Logger logger = LoggerFactory.getLogger(Application.class);
	
	
	/**
	 * Boilerplate main method for Spring Boot's execution hook.
	 * @param args System arguments for the application.
	 */
	public static void main(String[] args) {
		logger.info("Starting Spring Boot SampleStack Application");
		SpringApplication.run(Application.class, args);
	}
	
}
