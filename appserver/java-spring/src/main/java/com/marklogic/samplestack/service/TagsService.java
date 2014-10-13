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
package com.marklogic.samplestack.service;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.domain.ClientRole;

/**
 * Defines the TagsService, which returns suggested tags based on substrings.
 */
public interface TagsService {

	/**
	 * Wraps a call to REST API /v1/values to get back tag values and frequencies
	 * @param role Role to search with
	 * @param combinedQuery a JSON node containing the options definition for this query.
	 * @param start the first index to retrieve.
	 * @param pageLength TODO
	 * @return A values response in a JSON structure.
	 */
	public ObjectNode getTags(ClientRole role, ObjectNode combinedQuery, long start, long pageLength);

	

}
