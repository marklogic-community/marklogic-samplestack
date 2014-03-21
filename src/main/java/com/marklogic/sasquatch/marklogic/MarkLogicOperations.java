package com.marklogic.sasquatch.marklogic;

import java.io.InputStream;

public interface MarkLogicOperations {

	public String getJsonDocument(String docUri);
	
	public void insert(String graphIri, String mediaType, InputStream inputStream);
	public String sparql(String sparqlQuery);
	
}
