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

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.samplestack.domain.DocumentTag;
import com.marklogic.samplestack.impl.CustomObjectMapper;

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
	
	/**
	 * An enum to index the properties that configure database connections.
	 * TODO - prune to contrib and guest.
	 */
	public enum ClientRole {
		ADMIN, REST_ADMIN, SAMPLESTACK_CONTRIBUTOR, SAMPLESTACK_GUEST;
		private String getPrefix() {
			switch(this) {
	    	case ADMIN: return "marklogic.admin"; 
	    	case REST_ADMIN: return "marklogic.rest.admin"; 
	    	case SAMPLESTACK_CONTRIBUTOR: return "marklogic.writer"; 
	    	case SAMPLESTACK_GUEST: return "marklogic.guest";
	    	default: throw new SampleStackSecurityException();
			}
		}
		public String getUserParam() {
			return getPrefix() + ".user";
		}
		public String getPasswordParam() {
			return getPrefix() + ".password";
		}
	};
	
	@Autowired
	Environment env;
	
	@Bean
	public DatabaseClient databaseClient() {
		return databaseClient(ClientRole.SAMPLESTACK_CONTRIBUTOR);
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
	public ObjectMapper mapper() {
		return new CustomObjectMapper();
	}
	
	@Bean
	// wired into qna to trip JSON facade or not
	// TODO unwire probably, remove.
	public ServerTransform askTransform() {
		return new ServerTransform("ask");
		//return new ServerTransform("identity");
	}

	@Bean
	public JAXBContext jaxbContext() {
		JAXBContext context = null;
		try {
			context = JAXBContext.newInstance(DocumentTag.class);
		} catch (JAXBException e) {
			throw new SampleStackException(e);
		}
		return context;
	}

	
	public static void main(String[] args) {
		logger.debug("Starting Spring Boot SampleStack Application");
		SpringApplication.run(Application.class, args);
	}
	
}
