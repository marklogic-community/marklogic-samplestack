package com.marklogic.samplestack.service;

import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.SearchHandle;
import com.marklogic.client.query.QueryDefinition;

public interface MarkLogicOperations {

	public JsonNode getJsonDocument(String docUri);
	
	// public void insertGraph(String graphIri, String mediaType, InputStream inputStream);
	// public String sparql(String sparqlQuery);
	List<String> getDocumentUris(String directory);

	public SearchHandle searchDirectory(String directory, String queryString);

	public SearchHandle search(QueryDefinition queryDefinition);
	
	public SearchHandle search(QueryDefinition queryDefinition, long start);

	public void deleteDirectory(String string);

	public JSONDocumentManager newJSONDocumentManager();
	
}
