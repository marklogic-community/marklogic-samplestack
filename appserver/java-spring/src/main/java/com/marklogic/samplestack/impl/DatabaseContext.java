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
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.service.MarkLogicOperations;

/**
 * Contains the injection container wiring for the database tier.
 *
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
	
	private DatabaseClient databaseClient(ClientRole role) {
		String host = env.getProperty("marklogic.rest.host");
		Integer port = Integer.parseInt(env.getProperty("marklogic.rest.port"));
		String username = env.getProperty(role.getUserParam());
		String password = env.getProperty(role.getPasswordParam());
		return DatabaseClientFactory.newClient(host, port, username, password,
				Authentication.DIGEST);
	}
	
	@Autowired
	Environment env;
	
	
	@Bean
	/**
	 * Initializes a singleton ObjectMapper.
	 * @return A Jackson ObjectMapper implementation for the Spring IoC container
	 */
	public ObjectMapper mapper() {
		return new CustomObjectMapper();
	}
	
}
