/*
 * Copyright 2012-2014 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.samplestack.impl;

import java.util.HashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.Transaction;
import com.marklogic.client.document.DocumentPage;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.query.DeleteQueryDefinition;
import com.marklogic.client.query.QueryDefinition;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.QueryManager.QueryView;
import com.marklogic.client.query.RawQueryDefinition;
import com.marklogic.client.query.SuggestDefinition;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.SamplestackType;
import com.marklogic.samplestack.service.MarkLogicOperations;

public class MarkLogicClient implements MarkLogicOperations {

	@SuppressWarnings("unused")
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
		JacksonHandle jacksonHandle = getClient(role).newJSONDocumentManager()
				.read(uri, handle);
		return jacksonHandle.get();
	}

	
	@Override
	public DocumentPage searchInClass(ClientRole role, SamplestackType type,
			String queryString, long start) {
		QueryManager queryManager = getClient(role).newQueryManager();
		QueryDefinition stringQuery = 
				queryManager.newStringDefinition(type.optionsName())
				.withCriteria(queryString);

		stringQuery.setDirectory(type.directoryName());
		return newJSONDocumentManager(role).search(stringQuery, start);
	}

	@Override
	public void deleteDirectory(ClientRole role, SamplestackType type) {
		QueryManager queryManager = getClient(role).newQueryManager();
		DeleteQueryDefinition deleteDef = queryManager.newDeleteDefinition();
		deleteDef.setDirectory(type.directoryName());
		queryManager.delete(deleteDef);
	}

	public JSONDocumentManager newJSONDocumentManager(ClientRole role) {
		return getClient(role).newJSONDocumentManager();
	}

	
	@Override
	public DocumentPage search(ClientRole role,
			QueryDefinition queryDefinition, long start) {
		return newJSONDocumentManager(role).search(queryDefinition, start);
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
	public ObjectNode qnaSearch(ClientRole role, JsonNode structuredQuery,
			long start, QueryView view) {
		JacksonHandle handle = new JacksonHandle();
		String qnaDirName =  SamplestackType.QUESTIONS.directoryName();
		String optionsName = SamplestackType.QUESTIONS.optionsName();
		QueryManager queryManager = getClient(role).newQueryManager();
		RawQueryDefinition qdef = queryManager.newRawStructuredQueryDefinition(new JacksonHandle(structuredQuery), optionsName);
		qdef.setDirectory(qnaDirName);
		queryManager.setView(view);
		
		handle = queryManager.search(qdef, handle, start);
		return (ObjectNode) handle.get();
	}

	@Override
	public String[] suggestTags(ClientRole role, String suggestPattern) {
		QueryManager mgr = getClient(role).newQueryManager();
		SuggestDefinition suggestDefinition = mgr.newSuggestDefinition("tags");
		suggestDefinition.setStringCriteria(suggestPattern);
		return getClient(role).newQueryManager().suggest(suggestDefinition);
	}

	@Override
	public Transaction start(ClientRole role) {
		return getClient(role).openTransaction();
	}



}
