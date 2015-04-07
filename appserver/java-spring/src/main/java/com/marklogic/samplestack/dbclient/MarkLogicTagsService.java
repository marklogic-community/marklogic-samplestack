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

import java.util.ArrayList;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.RawCombinedQueryDefinition;
import com.marklogic.client.query.ValuesDefinition;
import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.service.TagsService;

/**
 * Implementation of TagsService (Not used in EA-3)
 */
@Component
public class MarkLogicTagsService extends MarkLogicBaseService implements
		TagsService {

	/**
	 * Wraps a call to REST API /v1/values to get back tag values and
	 * frequencies
	 * 
	 * @param role
	 *            Role to search with
	 * @param combinedQuery
	 *            a JSON node containing the options definition for this query.
	 * @param start
	 *            the first index to retrieve.
	 * @param forTag
	 *            The string pattern to filter tag results.
	 * @return A values response in a JSON structure.
	 */
	public ObjectNode getTags(ClientRole role, String forTag,
			ObjectNode combinedQuery, ArrayNode relatedTags, long start,
			long pageLength) {
		QueryManager queryManager = clients.get(role).newQueryManager();
		ValuesDefinition valdef = queryManager.newValuesDefinition("tags",
				"tags");
		JacksonHandle handle = new JacksonHandle();
		if (forTag != null) {
			String wildcardedTag = "tagword:\"*" + forTag + "*\"";

			if (combinedQuery != null) {
				// insert forTag as a tag query.
				JsonNode qtextNode = combinedQuery.get("search").findPath(
						"qtext");
				if (qtextNode.isMissingNode()) {
					((ObjectNode) combinedQuery.get("search")).put("qtext",
							wildcardedTag);
				} else if (qtextNode.isArray()) {
					((ArrayNode) combinedQuery.get("search").get("qtext"))
							.add(wildcardedTag);
				} else if (qtextNode.isTextual()) {
					String existingText = combinedQuery.get("search")
							.get("qtext").asText();
					ArrayNode newQtexts = ((ObjectNode) combinedQuery
							.get("search")).putArray("qtext");
					newQtexts.add(existingText);
					newQtexts.add(wildcardedTag);
				}
			}
			/*
			 * this is a guess -- if I get 10* the pagelength then I can filter
			 * and hope to get original pageLength from it.
			 */
			queryManager.setPageLength(pageLength * 1000);
		} else if (relatedTags != null) {
			queryManager.setPageLength(pageLength * 1000);
		} else {
			queryManager.setPageLength(pageLength);
		}
		if (combinedQuery != null) {
			handle.set(combinedQuery);
			RawCombinedQueryDefinition qdef = queryManager
					.newRawCombinedQueryDefinition(handle);
			valdef.setQueryDefinition(qdef);
		}
		JacksonHandle responseHandle;
		valdef.setAggregate("count");

		if (forTag == null && relatedTags == null) {
			responseHandle = queryManager
					.values(valdef, new JacksonHandle(), 1);
			return filterResponseBy((ObjectNode) responseHandle.get(), forTag, relatedTags,
					start, pageLength);
		} else {
			responseHandle = queryManager.values(valdef, new JacksonHandle(),
					start);
			return filterResponseBy((ObjectNode) responseHandle.get(), forTag, relatedTags,
					1, pageLength);

		}
	}

	private ObjectNode filterResponseBy(ObjectNode responseJson, String forTag,
			ArrayNode relatedTags, long start, long pageLength) {
		ArrayList<String> relatedTagsList = new ArrayList<String>();
		if (relatedTags != null) {
			for (JsonNode n : relatedTags) {
				relatedTagsList.add(n.asText());
			}
		}
		ObjectNode responseNode = (ObjectNode) responseJson
				.get("values-response");
		ArrayNode distinctValues = (ArrayNode) responseNode
				.get("distinct-value");
		if (distinctValues == null) {
			return responseJson;
		} else {
			distinctValues = distinctValues.deepCopy();
		}
		responseNode.remove("distinct-value");
		ArrayNode newValues = responseNode.putArray("distinct-value");
		int kept = 0;
		for (int i = 0; i < distinctValues.size() && kept < pageLength; i++) {
			ObjectNode value = (ObjectNode) distinctValues.get(i);
			String thisTag = value.get("_value").asText();
			if (relatedTagsList.contains(thisTag) ||
				(relatedTagsList.isEmpty() && forTag == null) ||
				(forTag != null && thisTag.contains(forTag))) {
				if (start > 1) {
					start--;
				} else {
					newValues.add(value);
					kept++;
				}
			} else {
				// pass
			}
		}
		return responseJson;
	}

}
