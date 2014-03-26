package com.marklogic.sasquatch;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
import com.marklogic.sasquatch.domain.GithubTag;
import com.marklogic.sasquatch.impl.SasquatchException;

@Configuration
@ComponentScan
@PropertySource("classpath:sasquatch.properties")
@EnableWebMvc
public class SasquatchConfiguration  extends WebMvcConfigurerAdapter {

	@Autowired
	Environment env;
	
	@Bean
	public DatabaseClient databaseClient() {
		String host = env.getProperty("markLogicHost");
		Integer port = Integer.parseInt(env.getProperty("markLogicPort"));
		String username = env.getProperty("applicationUser");
		String password = env.getProperty("applicationPassword");
		return DatabaseClientFactory.newClient(host, port, username, password,
				Authentication.DIGEST);
	}

	// TODO User client, auth
	
	@Bean
	public ObjectMapper mapper() {
		return new CustomObjectMapper();
	}
	

	@Bean
	public JAXBContext jaxbContext() {
		JAXBContext context = null;
		try {
			context = JAXBContext.newInstance(GithubTag.class);
		} catch (JAXBException e) {
			throw new SasquatchException(e);
		}
		return context;
	}

}