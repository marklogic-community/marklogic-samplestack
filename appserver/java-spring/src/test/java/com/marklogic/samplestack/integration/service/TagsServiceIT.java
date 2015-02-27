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
package com.marklogic.samplestack.integration.service;

import static org.junit.Assert.assertEquals;

import java.io.IOException;

import org.json.JSONException;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.skyscreamer.jsonassert.JSONAssert;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.dbclient.DatabaseContext;
import com.marklogic.samplestack.exception.SamplestackIOException;
import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.service.TagsService;
import com.marklogic.samplestack.testing.IntegrationTests;
import com.marklogic.samplestack.testing.TestDataManager;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = { DatabaseContext.class , TestDataManager.class})
@Category(IntegrationTests.class)
public class TagsServiceIT extends MarkLogicIntegrationIT {

	private final Logger logger = LoggerFactory
			.getLogger(TagsServiceIT.class);
	
	@Autowired
	TagsService tagsService;

	@Test
	public void testTagSearchWithForTag() throws JsonProcessingException, JSONException {

		ObjectNode topNode = mapper.createObjectNode();
		ObjectNode combinedQueryNode = topNode.putObject("search");
		ArrayNode qtextNode = combinedQueryNode.putArray("qtext");
		qtextNode.add("tag:test-data-tag");

		ObjectNode results;
		logger.debug("Query: " + mapper.writeValueAsString(topNode));
		results = tagsService.getTags(ClientRole.SAMPLESTACK_CONTRIBUTOR,
					"ada", topNode, null, 1, 1);
		logger.debug("Result: " + mapper.writeValueAsString(results));
		JSONAssert.assertEquals("{values-response:{name:\"tags\",type:\"xs:string\",distinct-value:[{frequency:2,_value:\"ada\"}]}}", mapper.writeValueAsString(results), false);
	}

	@Test
	public void testTagTwoSearch() throws JsonProcessingException, JSONException {


		ObjectNode topNode = mapper.createObjectNode();
		ObjectNode combinedQueryNode = topNode.putObject("search");
		ArrayNode qtextNode = combinedQueryNode.putArray("qtext");
		qtextNode.add("tag:test-data-tag");
		qtextNode.add("tag:ada");
		qtextNode.add("\"word abyss\"");

		ObjectNode results;
		logger.debug("Query: " + mapper.writeValueAsString(topNode));
		results = tagsService.getTags(ClientRole.SAMPLESTACK_CONTRIBUTOR,
					null, topNode, null, 1, 1);
		logger.debug("Result: " + mapper.writeValueAsString(results));
		JSONAssert.assertEquals("{values-response:{name:\"tags\",type:\"xs:string\",distinct-value:[{frequency:2,_value:\"ada\"}]}}", mapper.writeValueAsString(results), false);

	}

	@Test
	public void testAllTagValues() throws JsonProcessingException, JSONException {

		ObjectNode results;
		results = tagsService.getTags(ClientRole.SAMPLESTACK_CONTRIBUTOR,
					null, null, null, 1, 5);
		logger.debug("Result: " + mapper.writeValueAsString(results));
		assertEquals("Size of results for all tags: ", results.get("values-response").get("distinct-value").size(), 5L);

		// former test assertion before tag isolation introduced.
		// Still passes if seed data not loaded.
		// JSONAssert.assertEquals("{values-response:{name:\"tags\",type:\"xs:string\",distinct-value:[{frequency:2,_value:\"ada\"},{frequency:2,_value:\"javascript\"},{frequency:2,_value:\"python\"},{frequency:1,_value:\"blob\"},{frequency:11,_value:\"test-data-tag\"}]}}", mapper.writeValueAsString(results), false);
	}

	@Test
	public void testStructuredTagSearch() throws JsonProcessingException, JSONException {
		ObjectNode query;
		ObjectNode results = null;
		try {
			query = (ObjectNode) mapper
					.readValue(
							"{\"search\":{\"qtext\":\"tag:test-data-tag\",\"query\":{\"word-constraint-query\":{\"constraint-name\":\"tag\",\"text\":\"cloj*\"}}}}",
							JsonNode.class);
			results = tagsService.getTags(ClientRole.SAMPLESTACK_CONTRIBUTOR,
					"clo", query, null, 1, 1);

			logger.debug("Query Results:" + mapper.writeValueAsString(results));
		} catch (IOException e) {
			throw new SamplestackIOException(e);
		}
		JSONAssert.assertEquals("{values-response:{name:\"tags\",type:\"xs:string\",distinct-value:[{frequency:1,_value:\"clojure\"}]}}", mapper.writeValueAsString(results), false);

	}

}
