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
package com.marklogic.samplestack.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
import com.marklogic.client.pojo.PojoRepository;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.service.MarkLogicOperations;

/**
 * Contains the IoC wiring for the part of Samplestack that interacts with MarkLogic.
 */
@Component
@ComponentScan
@PropertySource("classpath:gradle.properties")
public class DatabaseContext {


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
	
	@Bean
	public PojoRepository<Contributor, String> repository() {
		return markLogicOperations().getContributors();
	}
	
	/**
	 * Constructs a Java Client API database Client, of which
	 * this application uses two long-lived instances.
	 * @param role The security role for whom whom to construct a connection
	 * @return A DatabaseClient for accessing MarkLogic 
	 */
	private DatabaseClient databaseClient(ClientRole role) {
		String host = env.getProperty("marklogic.rest.host");
		Integer port = Integer.parseInt(env.getProperty("marklogic.rest.port"));
		String username = env.getProperty(role.getUserParam());
		String password = env.getProperty(role.getPasswordParam());
		return DatabaseClientFactory.newClient(host, port, username, password,
				Authentication.DIGEST);
	}
	
	@Autowired
	/**
	 * Provided by Spring at startup, for accessing environment-specific variables.
	 */
	private Environment env;
	
	@Bean
	/**
	 * Initializes a singleton ObjectMapper.
	 * @return A Jackson ObjectMapper implementation for the Spring IoC container
	 */
	public ObjectMapper mapper() {
		return new CustomObjectMapper();
	}
	
}
