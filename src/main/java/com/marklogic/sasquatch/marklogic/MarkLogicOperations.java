package com.marklogic.sasquatch.marklogic;

import java.io.InputStream;
import java.util.List;

public interface MarkLogicOperations {

	public String getJsonDocument(String docUri);
	
	public void insertGraph(String graphIri, String mediaType, InputStream inputStream);
	public String sparql(String sparqlQuery);

	List<String> getDocumentUris(String directory);
	
}
