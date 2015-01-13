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
package com.marklogic.samplestack.dbclient;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.pojo.PojoRepository;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.security.ClientRole;

/**
 * Contains the IoC wiring for the part of Samplestack that interacts with MarkLogic.
 */
@Component
@ComponentScan
@PropertySource("classpath:gradle.properties")
public class DatabaseContext {

	@Autowired
	/** Spring provides this object at startup, for access to environment configuration
	 */
	private Environment env;
	
	@Bean
	/**
	 * Makes a HashMap of Client objects available to the application.
	 * @return A Clients class, which extends HashMap<ClientRole, DatabaseClient>;
	 */
	public Clients clients() {
		Clients clients = new Clients(env);
		return clients;
	}
	
	@Bean
	/**
	 * This repository object manages operations for the Contributor POJO Class.
	 * Generally accessed through calls to the ContributorService, which 
	 * mediates and limits some of the access.
	 * @return A PojoRepository object to manage Contributors.
	 */
	public PojoRepository<Contributor, String> repository() {
		return clients().get(ClientRole.SAMPLESTACK_CONTRIBUTOR)
				.newPojoRepository(Contributor.class, String.class);
	}
	
	@Bean
	/**
	 * Initializes a singleton ObjectMapper.
	 * @return A Jackson ObjectMapper implementation for the Spring IoC container
	 */
	public ObjectMapper mapper() {
		return new CustomObjectMapper();
	}
	
}
