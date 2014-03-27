package com.marklogic.sasquatch.impl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.FileHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.io.ValuesHandle;
import com.marklogic.client.query.CountedDistinctValue;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.RawCombinedQueryDefinition;
import com.marklogic.client.query.ValuesDefinition;
import com.marklogic.sasquatch.marklogic.MarkLogicOperations;

@Component
public class MarkLogicClient implements MarkLogicOperations {

	@Autowired
	protected DatabaseClient client;

	@Override
	public String getJsonDocument(String uri) {
		StringHandle stringHandle = client.newJSONDocumentManager().read(
				uri, new StringHandle());
		return stringHandle.get();
	}

//	@Override
//	public void insertGraph(String graphIri, String mediaType,
//			InputStream inputStream) {
//		GraphManager graphManager = client.newGraphManager();
//		graphManager.insert(graphIri, Format.TURTLE, new InputStreamHandle(
//				inputStream));
//	}

//	@Override
//	public String sparql(String sparqlQuery) {
//		SPARQLManager sparqlManager = client.newSPARQLManager();
//		StringHandle queryHandle = new StringHandle(sparqlQuery)
//				.withFormat(Format.SPARQL_QUERY);
//		// TODO query handles should set format themselves. fix marker
//		// interfaces.
//		StringHandle responseHandle = new StringHandle()
//				.withFormat(Format.JSON);
//		responseHandle = sparqlManager.sparql(queryHandle, responseHandle);
//		return responseHandle.get();
//	}

	
	@Override
	public List<String> getDocumentUris(String directory) {
		ClassPathResource values1 = new ClassPathResource("doc-uris.json");
		try {
			FileHandle fileHandle = new FileHandle(values1.getFile())
					.withFormat(Format.JSON);
			QueryManager queryManager = client.newQueryManager();
			RawCombinedQueryDefinition qdef = queryManager
					.newRawCombinedQueryDefinition(fileHandle);
			//StructuredQueryDefinition structuredQueryDefinition = new StructuredQueryBuilder().directory(true,  directory);
			ValuesDefinition valdef = queryManager.newValuesDefinition("docs");
			valdef.setQueryDefinition(qdef);
			ValuesHandle handle = client.newQueryManager().values(valdef,
					new ValuesHandle());

			List<String> docUrisList = new ArrayList<String>();
			for (CountedDistinctValue value : handle.getValues()) {
				docUrisList.add(value.get("string", String.class));
			}
			return docUrisList;
		} catch (IOException e) {
			throw new SasquatchException(e);
		}
	}
}
