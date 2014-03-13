package com.marklogic.sasquatch.marklogic;

import java.io.InputStream;

public interface SemanticsOperations {

	public void insert(String graphIri, String mediaType, InputStream inputStream);
	public String sparql(String sparqlQuery);
	
}
