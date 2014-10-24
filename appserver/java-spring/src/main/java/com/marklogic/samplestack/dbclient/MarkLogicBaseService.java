package com.marklogic.samplestack.dbclient;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.query.DeleteQueryDefinition;
import com.marklogic.client.query.QueryManager;
import com.marklogic.samplestack.security.ClientRole;

@Component
public abstract class MarkLogicBaseService {

	@Autowired
	protected Clients clients;

	protected JSONDocumentManager jsonDocumentManager(ClientRole role) {
		return clients.get(role).newJSONDocumentManager();
	};
	
	protected QueryManager queryManager(ClientRole role) {
		return clients.get(role).newQueryManager();
	}

	@Autowired
	protected ObjectMapper mapper;

	/**
	 * Gets a JSON document from the database as a Jackson JsonNode, 
	 * based on the caller's ClientRole and the document URI.
	 * @param role the caller's role.
	 * @param documentUri the document URI.
	 * @return A JsonNode containing the document.
	 */
	protected JsonNode getJsonDocument(ClientRole role, String documentUri) {
		JacksonHandle handle = new JacksonHandle();
		JacksonHandle jacksonHandle = clients.get(role).newJSONDocumentManager()
				.read(documentUri, handle);
		return jacksonHandle.get();
	}

	/**
	 * Removes an entire directory from the server
	 * @param role the caller's role.
	 * @param directory The directory to delete.
	 */
	protected void deleteDirectory(ClientRole role, String directory) {
		QueryManager queryManager = clients.get(role).newQueryManager();
		DeleteQueryDefinition deleteDef = queryManager.newDeleteDefinition();
		deleteDef.setDirectory(directory);
		queryManager.delete(deleteDef);
	}

}
