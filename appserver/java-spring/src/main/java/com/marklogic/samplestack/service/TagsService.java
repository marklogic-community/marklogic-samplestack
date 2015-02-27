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
package com.marklogic.samplestack.service;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.security.ClientRole;

/**
 * Defines the TagsService, which returns suggested tags based on substrings.
 * There are two use cases for tag service.  One is the scenario in
 * which only a subset of values results.  This subset matches the string
 * pattern for the tags.
 * <p>
 * Otherwise, the tag response comes directly from the vall to MarkLogic's
 *   /v1/values/{name} endpoint.
 */
public interface TagsService {

	/**
	 * Wraps a call to REST API /v1/values to get back tag values and frequencies
	 * @param role Role to search with
	 * @param tagPattern A pattern to filter the tag result.
	 * @param combinedQuery a JSON node containing the options definition for this query.
	 * @param relatedTags Tags related to the target, for semantic graph extension
	 * @param start the first index to retrieve.
	 * @param pageLength The number of tags to return.
	 * @return A values response in a JSON structure.
	 */
	public ObjectNode getTags(ClientRole role, String tagPattern, ObjectNode combinedQuery, ArrayNode relatedTags, long start, long pageLength);

}
