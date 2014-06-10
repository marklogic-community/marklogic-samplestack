package com.marklogic.samplestack.service;

import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.io.SearchHandle;
import com.marklogic.client.query.QueryDefinition;
import com.marklogic.samplestack.domain.ClientRole;

public interface MarkLogicOperations {

	public JsonNode getJsonDocument(ClientRole role, String documentUri);
	
	// public void insertGraph(String graphIri, String mediaType, InputStream inputStream);
	// public String sparql(String sparqlQuery);
	List<String> getDocumentUris(ClientRole role, String directory);

	public SearchHandle searchDirectory(ClientRole role, String directory, String queryString);

	public SearchHandle search(ClientRole role, QueryDefinition queryDefinition);
	
	public SearchHandle search(ClientRole role, QueryDefinition queryDefinition, long start);

	public void deleteDirectory(ClientRole role, String string);
	
	public void delete(ClientRole role, String documentUri);

	public JSONDocumentManager newJSONDocumentManager(ClientRole role);
	
	/**
	 * Initializes a resource manager, part of setup for application context
	 * @param name name or resource extension
	 * @param testResourceManager
	 */
	public <T extends ResourceManager> void initResource(ClientRole role, String name,
			T resourceManager);
	
}
