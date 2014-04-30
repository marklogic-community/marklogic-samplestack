package com.marklogic.sampleStack;

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
import org.springframework.context.annotation.EnableMBeanExport;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
import com.marklogic.sampleStack.domain.DocumentTag;
import com.marklogic.sampleStack.impl.CustomObjectMapper;

@Configuration
@ComponentScan
@PropertySource("classpath:gradle.properties")
@EnableAutoConfiguration
@EnableGlobalMethodSecurity(prePostEnabled=true)
public class Application {

	private static final Logger logger = LoggerFactory.getLogger(Application.class);
	
	public enum ClientRole {
		ADMIN, REST_ADMIN, REST_WRITER, REST_READER;
		private String getPrefix() {
			switch(this) {
	    	case ADMIN: return "admin"; 
	    	case REST_ADMIN: return "restAdmin"; 
	    	case REST_WRITER: return "restWriter"; 
	    	case REST_READER: return "restReader";
	    	default: throw new SampleStackSecurityException();
			}
		}
		public String getUserParam() {
			return getPrefix() + "Username";
		}
		public String getPasswordParam() {
			return getPrefix() + "Password";
		}
	};
	
	@Autowired
	Environment env;
	
	@Bean
	public DatabaseClient databaseClient() {
		return databaseClient(ClientRole.ADMIN);
	}
	
	private DatabaseClient databaseClient(ClientRole role) {
		String host = env.getProperty("markLogicHost");
		Integer port = Integer.parseInt(env.getProperty("markLogicPort"));
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
