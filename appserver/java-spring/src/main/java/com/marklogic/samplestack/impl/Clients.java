package com.marklogic.samplestack.impl;

import java.util.HashMap;

import org.springframework.core.env.Environment;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
import com.marklogic.samplestack.domain.ClientRole;

@SuppressWarnings("serial")
public class Clients extends HashMap<ClientRole, DatabaseClient> {

	/**
	 * Provided by Spring at startup, for accessing environment-specific variables.
	 */
	private Environment env;
	
	Clients(Environment env) {
		super();
		this.env = env;
		DatabaseClient writerClient = databaseClient(ClientRole.SAMPLESTACK_CONTRIBUTOR);
		DatabaseClient guestClient = databaseClient(ClientRole.SAMPLESTACK_GUEST);
		put(ClientRole.SAMPLESTACK_CONTRIBUTOR, writerClient);
		put(ClientRole.SAMPLESTACK_GUEST, guestClient);
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
}
