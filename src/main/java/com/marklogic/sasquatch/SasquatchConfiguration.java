package com.marklogic.sasquatch;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;

@Configuration
@PropertySource("classpath:sasquatch.properties")
public class SasquatchConfiguration  {

	
	
	@Autowired
	Environment env;
	
	@Bean
	public DatabaseClient databaseClient() {
		String host = env.getProperty("host");
		Integer port = Integer.parseInt(env.getProperty("port"));
		String username = env.getProperty("username");
		String password = env.getProperty("password");
		return DatabaseClientFactory.newClient(host, port, username, password,
				Authentication.DIGEST);
	}

	@Bean
	public ObjectMapper mapper() {
		return new ObjectMapper();
	}
	
	
}