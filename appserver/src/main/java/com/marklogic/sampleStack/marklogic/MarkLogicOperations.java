package com.marklogic.sampleStack.marklogic;

import java.util.List;

import com.marklogic.client.io.SearchHandle;

public interface MarkLogicOperations {

	public String getJsonDocument(String docUri);
	
	// public void insertGraph(String graphIri, String mediaType, InputStream inputStream);
	// public String sparql(String sparqlQuery);

	List<String> getDocumentUris(String directory);

	public SearchHandle searchDirectory(String directory, String queryString);
	
}
