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

import static com.marklogic.samplestack.SamplestackConstants.QUESTIONS_DIRECTORY;
import static com.marklogic.samplestack.SamplestackConstants.QUESTIONS_OPTIONS;

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
import com.marklogic.client.pojo.PojoRepository;
import com.marklogic.client.query.DeleteQueryDefinition;
import com.marklogic.client.query.QueryDefinition;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.QueryManager.QueryView;
import com.marklogic.client.query.RawCombinedQueryDefinition;
import com.marklogic.client.query.RawQueryDefinition;
import com.marklogic.client.query.StringQueryDefinition;
import com.marklogic.client.query.SuggestDefinition;
import com.marklogic.client.query.ValuesDefinition;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.service.MarkLogicOperations;


/**
 * Encapsulates Samplestack's interactions with the database in a single class.
 * See MarkLogicOperations for documentation of overridden methods.
 * 
 * @see com.marklogic.client.DatabaseClient
 */
public class MarkLogicClient implements MarkLogicOperations {


	@SuppressWarnings("unused")
	private final Logger logger = LoggerFactory
			.getLogger(MarkLogicClient.class);

	protected HashMap<ClientRole, DatabaseClient> clients;

	private DatabaseClient getClient(ClientRole role) {
		return clients.get(role);
	}

	private PojoRepository<Contributor, String> contributors;

	/**
	 * No-argument constructor.
	 */
	public MarkLogicClient() {
		clients = new HashMap<ClientRole, DatabaseClient>();
	}

	@Override
	/**
	 * Gets a JSON document from the database as a Jackson JsonNode, 
	 * based on the caller's ClientRole and the document URI.
	 * @param role the caller's role.
	 * @param documentUri the document URI.
	 * @return A JsonNode containing the document.
	 */
	public JsonNode getJsonDocument(ClientRole role, String documentUri) {
		JacksonHandle handle = new JacksonHandle();
		JacksonHandle jacksonHandle = getClient(role).newJSONDocumentManager()
				.read(documentUri, handle);
		return jacksonHandle.get();
	}

	@Override
	public ObjectNode findOneQuestion(ClientRole role,
			String queryString, long start) {
		QueryManager queryManager = getClient(role).newQueryManager();
		QueryDefinition stringQuery = queryManager.newStringDefinition(
				QUESTIONS_OPTIONS).withCriteria(queryString);

		stringQuery.setDirectory(QUESTIONS_DIRECTORY);
		DocumentPage page = newJSONDocumentManager(role).search(stringQuery, start);
		if (page.hasNext()) {
			JacksonHandle handle = new JacksonHandle();
			handle = page.nextContent(handle);
			return (ObjectNode) handle.get();
		}
		else {
			return null;
		}
	}

	@Override
	public void deleteDirectory(ClientRole role, String directory) {
		QueryManager queryManager = getClient(role).newQueryManager();
		DeleteQueryDefinition deleteDef = queryManager.newDeleteDefinition();
		deleteDef.setDirectory(directory);
		queryManager.delete(deleteDef);
	}

	@Override
	public JSONDocumentManager newJSONDocumentManager(ClientRole role) {
		return getClient(role).newJSONDocumentManager();
	}

	public DocumentPage search(ClientRole role,
			QueryDefinition queryDefinition, long start) {
		return newJSONDocumentManager(role).search(queryDefinition, start);
	}

	/**
	 * Part of setup of this object, puts a DatabaseClient connection into a
	 * pool of connections based on client role.
	 * 
	 * @param role
	 *            the caller's role
	 * @param client
	 *            A DatabaseClient object for interacting with MarkLogic
	 */
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
		QueryManager queryManager = getClient(role).newQueryManager();

		RawQueryDefinition qdef = queryManager.newRawStructuredQueryDefinition(
				new JacksonHandle(structuredQuery), QUESTIONS_OPTIONS);
		qdef.setDirectory(QUESTIONS_DIRECTORY);
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

	@Override
	public PojoRepository<Contributor, String> getContributors() {
		if (this.contributors == null) {
			this.contributors = getClient(ClientRole.SAMPLESTACK_CONTRIBUTOR)
					.newPojoRepository(Contributor.class, String.class);
		}
		return this.contributors;
	}

	@Override
	public StringQueryDefinition newStringQueryDefinition(String optionsName) {
		QueryManager queryManager = getClient(
				ClientRole.SAMPLESTACK_CONTRIBUTOR).newQueryManager();
		return queryManager.newStringDefinition(optionsName);
	}

	@Override
	public ObjectNode tagValues(ClientRole role, JsonNode combinedQuery, long start) {
		QueryManager queryManager = getClient(role).newQueryManager();
		ValuesDefinition valdef = queryManager.newValuesDefinition("tags");
		JacksonHandle handle = new JacksonHandle();
		handle.set(combinedQuery);
		RawCombinedQueryDefinition qdef = queryManager.newRawCombinedQueryDefinition(handle);
		valdef.setQueryDefinition(qdef);
		JacksonHandle responseHandle = queryManager.values(valdef, new JacksonHandle(), start);
		return (ObjectNode) responseHandle.get();
	}

}
