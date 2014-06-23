package com.marklogic.samplestack.impl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.DocumentPage;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.io.FileHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.SearchHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.io.ValuesHandle;
import com.marklogic.client.query.CountedDistinctValue;
import com.marklogic.client.query.DeleteQueryDefinition;
import com.marklogic.client.query.QueryDefinition;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.QueryManager.QueryView;
import com.marklogic.client.query.RawCombinedQueryDefinition;
import com.marklogic.client.query.RawQueryDefinition;
import com.marklogic.client.query.ValuesDefinition;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.SamplestackType;
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
	public DocumentPage searchDirectory(ClientRole role, SamplestackType type,
			String queryString) {
		return searchDirectory(role, type, queryString, 1);
	}
	
	@Override
	public DocumentPage searchDirectory(ClientRole role, SamplestackType type,
			String queryString, long start) {
		QueryManager queryManager = getClient(role).newQueryManager();
		QueryDefinition stringQuery = 
				queryManager.newStringDefinition(type.optionsName())
				.withCriteria(queryString);

		stringQuery.setDirectory(type.directoryName());
		return newJSONDocumentManager(role).search(stringQuery, start);
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

	@Override
	public ObjectNode rawStructuredSearch(ClientRole role, SamplestackType searchType,
			JsonNode structuredQuery, long start, QueryView view) {
		JacksonHandle handle = new JacksonHandle();
		String qnaDirName =  searchType.directoryName();
		String optionsName = searchType.optionsName();
		QueryManager queryManager = getClient(role).newQueryManager();
		RawQueryDefinition qdef = queryManager.newRawStructuredQueryDefinition(new JacksonHandle(structuredQuery), optionsName);
		qdef.setDirectory(qnaDirName);
		queryManager.setView(view);
		
		handle = queryManager.search(qdef, handle, start);
		return (ObjectNode) handle.get();
	}

}
