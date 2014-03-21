package com.marklogic.sasquatch.impl;

import java.io.InputStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.semantics.GraphManager;
import com.marklogic.client.semantics.SPARQLManager;
import com.marklogic.sasquatch.marklogic.MarkLogicOperations;
import com.sun.xml.internal.bind.annotation.OverrideAnnotationOf;

@Component
public class MarkLogicClient implements MarkLogicOperations {

	@Autowired
	private DatabaseClient client;

	@Override
	public String getJsonDocument(String uri) {
		StringHandle stringHandle = client.newJSONDocumentManager().read(
				uri, new StringHandle());
		return stringHandle.get();
	}

	@Override
	public void insert(String graphIri, String mediaType,
			InputStream inputStream) {
		GraphManager graphManager = client.newGraphManager();
		graphManager.insert(graphIri, Format.TURTLE, new InputStreamHandle(
				inputStream));
	}

	@Override
	public String sparql(String sparqlQuery) {
		SPARQLManager sparqlManager = client.newSPARQLManager();
		StringHandle queryHandle = new StringHandle(sparqlQuery)
				.withFormat(Format.SPARQL_QUERY);
		// TODO query handles should set format themselves. fix marker
		// interfaces.
		StringHandle responseHandle = new StringHandle()
				.withFormat(Format.JSON);
		responseHandle = sparqlManager.sparql(queryHandle, responseHandle);
		return responseHandle.get();
	}

}
