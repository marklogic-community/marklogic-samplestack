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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.RawCombinedQueryDefinition;
import com.marklogic.client.query.StringQueryDefinition;
import com.marklogic.client.query.ValuesDefinition;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.service.MarkLogicOperations;


@Component
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

	@Autowired
	private Clients clients;
	
	
	@Override
	public JSONDocumentManager newJSONDocumentManager(ClientRole role) {
		return clients.get(role).newJSONDocumentManager();
	}

	@Override
	public StringQueryDefinition newStringQueryDefinition(String optionsName) {
		QueryManager queryManager = clients.get(
				ClientRole.SAMPLESTACK_CONTRIBUTOR).newQueryManager();
		return queryManager.newStringDefinition(optionsName);
	}

	@Override
	public ObjectNode tagValues(ClientRole role, JsonNode combinedQuery, long start) {
		QueryManager queryManager = clients.get(role).newQueryManager();
		ValuesDefinition valdef = queryManager.newValuesDefinition("tags");
		JacksonHandle handle = new JacksonHandle();
		handle.set(combinedQuery);
		RawCombinedQueryDefinition qdef = queryManager.newRawCombinedQueryDefinition(handle);
		valdef.setQueryDefinition(qdef);
		JacksonHandle responseHandle = queryManager.values(valdef, new JacksonHandle(), start);
		return (ObjectNode) responseHandle.get();
	}
	
}
