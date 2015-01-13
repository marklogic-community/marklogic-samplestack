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

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.RawCombinedQueryDefinition;
import com.marklogic.client.query.ValuesDefinition;
import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.service.TagsService;

/**
 * Implementation of TagsService
 * (Not used in EA-3)
 */
@Component
public class MarkLogicTagsService extends MarkLogicBaseService implements TagsService {

	/**
	 * Wraps a call to REST API /v1/values to get back tag values and frequencies
	 * @param role Role to search with
	 * @param combinedQuery a JSON node containing the options definition for this query.
	 * @param start the first index to retrieve.
	 * @return A values response in a JSON structure.
	 */
	public ObjectNode getTags(ClientRole role, ObjectNode combinedQuery, long start, long pageLength) {
		QueryManager queryManager = clients.get(role).newQueryManager();
		ValuesDefinition valdef = queryManager.newValuesDefinition("tags", "tags");
		if (combinedQuery != null) {
			JacksonHandle handle = new JacksonHandle();
			handle.set(combinedQuery);
			RawCombinedQueryDefinition qdef = queryManager.newRawCombinedQueryDefinition(handle);
			valdef.setQueryDefinition(qdef);
		}
		queryManager.setPageLength(pageLength);
		valdef.setAggregate("count");
		JacksonHandle responseHandle = queryManager.values(valdef, new JacksonHandle(), start);
		return (ObjectNode) responseHandle.get();
	}

}
