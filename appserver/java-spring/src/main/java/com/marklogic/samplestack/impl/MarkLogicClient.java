package com.marklogic.samplestack.impl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.DocumentDescriptor;
import com.marklogic.client.document.DocumentPage;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.FileHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.SearchHandle;
import com.marklogic.client.io.ValuesHandle;
import com.marklogic.client.query.CountedDistinctValue;
import com.marklogic.client.query.DeleteQueryDefinition;
import com.marklogic.client.query.QueryDefinition;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.RawCombinedQueryDefinition;
import com.marklogic.client.query.StringQueryDefinition;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.client.query.ValuesDefinition;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.exception.SamplestackIOException;
import com.marklogic.samplestack.service.MarkLogicOperations;

public class MarkLogicClient implements MarkLogicOperations {

	private final Logger logger = LoggerFactory
			.getLogger(MarkLogicClient.class);

	protected HashMap<ClientRole, DatabaseClient> clients;

	private DatabaseClient getClient(ClientRole role) {
		return clients.get(role);
	}

	public MarkLogicClient() {
		clients = new HashMap<ClientRole, DatabaseClient>();
	}

	@Override
	public JsonNode getJsonDocument(ClientRole role, String uri) {
		JacksonHandle handle = new JacksonHandle();
		handle.setFormat(Format.JSON);
		JacksonHandle jacksonHandle = getClient(role).newJSONDocumentManager()
				.read(uri, handle);
		return jacksonHandle.get();
	}

	@Override
	public List<String> getDocumentUris(ClientRole role, String directory) {
		ClassPathResource values1 = new ClassPathResource("doc-uris.json");
		try {
			FileHandle fileHandle = new FileHandle(values1.getFile())
					.withFormat(Format.JSON);
			QueryManager queryManager = getClient(role).newQueryManager();
			RawCombinedQueryDefinition qdef = queryManager
					.newRawCombinedQueryDefinition(fileHandle);
			ValuesDefinition valdef = queryManager.newValuesDefinition("docs");
			valdef.setQueryDefinition(qdef);
			ValuesHandle handle = queryManager.values(valdef,
					new ValuesHandle());

			List<String> docUrisList = new ArrayList<String>();
			for (CountedDistinctValue value : handle.getValues()) {
				String valueString = value.get("string", String.class);
				// TODO refactor to actually query properly.
				if (valueString.startsWith(directory)) {
					docUrisList.add(value.get("string", String.class));
				} else {
				}
			}
			return docUrisList;
		} catch (IOException e) {
			throw new SamplestackIOException(e);
		}
	}

	@Override
	public DocumentPage searchDirectory(ClientRole role, String directory,
			String queryString) {
		return searchDirectory(role, directory, queryString, 1, null);
	}
	
	@Override
	public DocumentPage searchDirectory(ClientRole role, String directory,
			String queryString, long start, SearchHandle handle) {
		QueryManager queryManager = getClient(role).newQueryManager();
		QueryDefinition stringQuery = 
				queryManager.newStringDefinition(directory.replaceAll("\\/",  ""))
				.withCriteria(queryString);

		stringQuery.setDirectory(directory);
		return newJSONDocumentManager(role).search(stringQuery, start, handle);
	}

	@Override
	public void deleteDirectory(ClientRole role, String directory) {
		QueryManager queryManager = getClient(role).newQueryManager();
		DeleteQueryDefinition deleteDef = queryManager.newDeleteDefinition();
		deleteDef.setDirectory(directory);
		queryManager.delete(deleteDef);
	}

	public JSONDocumentManager newJSONDocumentManager(ClientRole role) {
		return getClient(role).newJSONDocumentManager();
	}

	
	@Override
	public DocumentPage search(ClientRole role,
			QueryDefinition queryDefinition, long start, SearchHandle handle) {
		return newJSONDocumentManager(role).search(queryDefinition, start, handle);
	}

	public void putClient(ClientRole role, DatabaseClient client) {
		clients.put(role, client);
	}

	@Override
	public <T extends ResourceManager> void initResource(ClientRole role,
			String name, T resourceManager) {
		getClient(role).init(name, resourceManager);
	}

	@Override
	public void delete(ClientRole role, String documentUri) {
		getClient(role).newJSONDocumentManager().delete(documentUri);
	}

}
