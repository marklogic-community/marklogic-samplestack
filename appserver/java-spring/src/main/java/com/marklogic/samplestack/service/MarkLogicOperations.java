package com.marklogic.samplestack.service;

import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.document.DocumentPage;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.io.SearchHandle;
import com.marklogic.client.query.QueryDefinition;
import com.marklogic.client.query.RawStructuredQueryDefinition;
import com.marklogic.samplestack.domain.ClientRole;

public interface MarkLogicOperations {

	public JsonNode getJsonDocument(ClientRole role, String documentUri);
	
	// public void insertGraph(String graphIri, String mediaType, InputStream inputStream);
	// public String sparql(String sparqlQuery);
	List<String> getDocumentUris(ClientRole role, String directory);

	/**
	 * Convenience method to send a String query over a particular range of documents.
	 * The expectation is that there will be an options node on the server that corresponds
	 * to this directory/Class of objects, and which configures the search string
	 * that the client uses here.
	 * @param role The security role under which to run the query.
	 * @param directory The directory to look in.  Must begin and end with '/'
	 * @param queryString The Search API query string, as configured by a persisted options file.
	 * @return A page of results.
	 */
	public DocumentPage searchDirectory(ClientRole role, String directory, String queryString);

	/**
	 * Convenience method to send a String query over a particular range of documents.
	 * The expectation is that there will be an options node on the server that corresponds
	 * to this directory/Class of objects, and which configures the search string
	 * that the client uses here.  This version of search provides a SearchHandle object
	 * which is populated by data from the Search API response object.
	 * @param role The security role under which to run the query.
	 * @param directory The directory to look in.  Must begin and end with '/'
	 * @param queryString The Search API query string, as configured by a persisted options file.
	 * @param handle A SearchHandle that is to be filled with data from the search.  
	 *  If null, the client will not ask for Search API to return the search payload,
	 *  but only the page of objects.
	 * @param start The index of the first result returned.
	 * @return A page of results.
	 */
	public DocumentPage searchDirectory(ClientRole role, String directory,
			String queryString, long start, SearchHandle handle);
	
	public DocumentPage search(ClientRole role, QueryDefinition queryDefinition, 
			long start, SearchHandle handle);

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
