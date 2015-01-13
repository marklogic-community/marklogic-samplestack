/*
 * Copyright 2012-2015 MarkLogic Corporation
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
package com.marklogic.samplestack.dbclient;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.query.DeleteQueryDefinition;
import com.marklogic.client.query.QueryManager;
import com.marklogic.samplestack.security.ClientRole;

/**
 * A base class for services that interact with MarkLogic.
 */
@Component
public abstract class MarkLogicBaseService {

	@Autowired
	protected Clients clients;

	/**
	 * Gets a new MarkLogic JSONDocumentManager based on a ClientRole.
	 * @param role The Role to secure the manager.
	 * @return A JSONDocumentManager
	 */
	protected JSONDocumentManager jsonDocumentManager(ClientRole role) {
		return clients.get(role).newJSONDocumentManager();
	};
	
	/**
	 * Gets a new MarkLogic QueryManager based on a ClientRole.
	 * @param role
	 * @return A QueryManager
	 */
	protected QueryManager queryManager(ClientRole role) {
		return clients.get(role).newQueryManager();
	}

	@Autowired
	protected ObjectMapper mapper;

	/**
	 * Gets a JSON document from the database as a Jackson JsonNode, 
	 * based on the caller's ClientRole and the document URI.
	 * @param role the caller's role.
	 * @param documentUri the document URI.
	 * @return A JsonNode containing the document.
	 */
	protected JsonNode getJsonDocument(ClientRole role, String documentUri) {
		JacksonHandle handle = new JacksonHandle();
		JacksonHandle jacksonHandle = clients.get(role).newJSONDocumentManager()
				.read(documentUri, handle);
		return jacksonHandle.get();
	}

	/**
	 * Removes an entire directory from the server
	 * @param role the caller's role.
	 * @param directory The directory to delete.
	 */
	protected void deleteDirectory(ClientRole role, String directory) {
		QueryManager queryManager = clients.get(role).newQueryManager();
		DeleteQueryDefinition deleteDef = queryManager.newDeleteDefinition();
		deleteDef.setDirectory(directory);
		queryManager.delete(deleteDef);
	}

}
