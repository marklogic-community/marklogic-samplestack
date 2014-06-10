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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.impl.CustomObjectMapper;
import com.marklogic.samplestack.impl.MarkLogicClient;
import com.marklogic.samplestack.service.MarkLogicOperations;

@Configuration
@ComponentScan
@PropertySource("classpath:gradle.properties")
@EnableAutoConfiguration
@EnableGlobalMethodSecurity(prePostEnabled=true)
/**
 * Top-Level application runner and application context configuration for
 * Samplestack.
 * 
 * Spring boot uses this class's main method to initialize the application.
 */
public class Application {

	private static final Logger logger = LoggerFactory.getLogger(Application.class);
	
	@Autowired
	Environment env;
	
	@Bean
	/**
	 * Initializes the connector to MarkLogic, 
	 * which pools two DatabaseClient instances for the two security roles in Samplestack.
	 * @return A MarkLogicOperations bean for the Spring IoC container
	 */
	public MarkLogicOperations markLogicOperations() {
		MarkLogicClient c = new MarkLogicClient();
		DatabaseClient writerClient = databaseClient(ClientRole.SAMPLESTACK_CONTRIBUTOR);
		c.putClient(ClientRole.SAMPLESTACK_CONTRIBUTOR, writerClient);
		DatabaseClient guestClient = databaseClient(ClientRole.SAMPLESTACK_GUEST);
		c.putClient(ClientRole.SAMPLESTACK_GUEST, guestClient);
		return c;
	}
	
	private DatabaseClient databaseClient(ClientRole role) {
		String host = env.getProperty("marklogic.rest.host");
		Integer port = Integer.parseInt(env.getProperty("marklogic.rest.port"));
		String username = env.getProperty(role.getUserParam());
		String password = env.getProperty(role.getPasswordParam());
		return DatabaseClientFactory.newClient(host, port, username, password,
				Authentication.DIGEST);
	}
	
	@Bean
	/**
	 * Initializes a singleton ObjectMapper.
	 * @return A Jackson ObjectMapper implementation for the Spring IoC container
	 */
	public ObjectMapper mapper() {
		return new CustomObjectMapper();
	}
	
	/**
	 * Boilerplate main method for Spring Boot's execution hook.
	 * @param args System arguments for the application.
	 */
	public static void main(String[] args) {
		logger.debug("Starting Spring Boot SampleStack Application");
		SpringApplication.run(Application.class, args);
	}
	
}
