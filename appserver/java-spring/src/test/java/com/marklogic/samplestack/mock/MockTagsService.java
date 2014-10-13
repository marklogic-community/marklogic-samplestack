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
package com.marklogic.samplestack.mock;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.service.TagsService;

@Component
/**
 * A mocked implementation of TagsService for unit testing.
 */
public class MockTagsService extends MockServiceBase implements TagsService {

	Logger logger = LoggerFactory.getLogger(MockTagsService.class);

	ObjectNode expectedTags;
	ObjectNode oneItemTags;
	ObjectNode itemOrderTags;

	
	public ObjectNode getTags(ClientRole role, ObjectNode combinedQuery,
			long start, long pageLength) {
		
		try {
			logger.debug(mapper.writeValueAsString(combinedQuery));
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		if (expectedTags == null) {
			expectedTags = (ObjectNode) getTestJson("searchresults/tags-response.json");
		}
		if (oneItemTags == null) {
			oneItemTags = (ObjectNode) getTestJson("searchresults/one-value-tags-response.json");
		}
		if (itemOrderTags == null) {
			itemOrderTags = (ObjectNode) getTestJson("searchresults/item-order-tags-response.json");
		}
		
		ObjectNode options = (ObjectNode) combinedQuery.get("search").get("options");
		/* mock a page length of one */
		if (pageLength == 1) return oneItemTags;
		/* mock a query that returns one value */
		if (combinedQuery.get("search").get("qtext") != null) {
			if (combinedQuery.get("search").get("qtext").asText().equals("tag:ada")) {
			return oneItemTags;
		}
		}
		else if (options.get("values").get("values-option") != null) {
			if (options.get("values").get("values-option").asText().equals("item-order"))  {
				return itemOrderTags;
			}
		}
		return expectedTags;
	}
}
