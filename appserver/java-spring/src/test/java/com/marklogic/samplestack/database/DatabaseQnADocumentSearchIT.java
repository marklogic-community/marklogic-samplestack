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
package com.marklogic.samplestack.database;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.io.IOException;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.exception.SamplestackIOException;
import com.marklogic.samplestack.impl.Clients;
import com.marklogic.samplestack.impl.DatabaseContext;
import com.marklogic.samplestack.impl.MarkLogicQnAService;
import com.marklogic.samplestack.testing.DatabaseExtensionTests;
import com.marklogic.samplestack.testing.TestDataManager;

/**
 * Tests the functionality of the search services installed on the server.
 * Depends on database/options/questions.json Depends on security setup
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {DatabaseContext.class, TestDataManager.class})
@Category(DatabaseExtensionTests.class)
public class DatabaseQnADocumentSearchIT {

	private final Logger logger = LoggerFactory
			.getLogger(DatabaseQnADocumentSearchIT.class);

	@Autowired
	private ObjectMapper mapper;

	@Autowired
	private Clients clients;

	@Autowired
	private MarkLogicQnAService qnaService;

	@Test
	/**
	 * On the home page, with no search string executed, 
	 * the default order is by lastActivityDate descending.
	 * 
	 * This search includes
	 * results:
	 * score
	 * nanswers
	 * answered or not
	 * title
	 * tags
	 * creationDate
	 * owner/username
	 * 
	 * facets:
	 * tags, frequency ordered, limit n
	 * date, buckets, probably combined query to support.
	 * 
	 * inputs
	 * main search string
	 * checkboxes (show mine only)
	 * 
	 * options:
	 * sort by newest (lastActivityDate descending)
	 * sort by relevance (score)
	 */
	public void defaultSearchOrdersByActivityDescending() {
		ObjectNode query = mapper.createObjectNode();
		ObjectNode queryNode = query.putObject("query");
		queryNode.put("qtext", "");
		ObjectNode results = qnaService.rawSearch(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, query, 1, false);
		assertTrue("Need data to test searches", results.size() > 0);
	}

	@Test
	public void guestSearchSeesOnlyResolvedQuestions() {
		ObjectNode query = mapper.createObjectNode();
		ObjectNode queryNode = query.putObject("query");
		queryNode.put("qtext", "");
		ObjectNode results = qnaService.rawSearch(ClientRole.SAMPLESTACK_GUEST,
				query, 1, false);
		assertEquals("Guest sees only approved docs", results.get("results")
				.size(), 2);
	}

	@Test
	public void authenticatedSearchSeesUnresolvedQuestions() {
		ObjectNode query = mapper.createObjectNode();
		ObjectNode queryNode = query.putObject("query");
		queryNode.put("qtext", "");
		ObjectNode results = qnaService.rawSearch(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, query, 1, false);
		assertEquals("Logged-in user sees all docs", results.get("results")
				.size(), 11);
	}

	@Test
	@Ignore
	public void testResponsePayloadFacets() {

	}

	@Test
	public void testAcceptedSearch() {
		ObjectNode query;
		ObjectNode results = null;
		try {
			query = (ObjectNode) mapper
					.readValue(
							"{\"query\":{\"value-constraint-query\":{\"constraint-name\":\"resolved\",\"boolean\":true}}}",
							JsonNode.class);
			results = qnaService.rawSearch(ClientRole.SAMPLESTACK_CONTRIBUTOR,
					query, 1, false);

			logger.debug("Query Results:" + mapper.writeValueAsString(results));

			logger.debug("Query Text:"
					+ mapper.writeValueAsString(results.get("report")));

		} catch (IOException e) {
			throw new SamplestackIOException(e);
		}
		assertEquals("JSON has 2 result", 2, results.get("total").asInt());
	}

	@Test
	public void testActivitySearch() {
		ObjectNode query;
		ObjectNode results = null;
		try {
			query = (ObjectNode) mapper.readValue("{\"query\":"
					+ "{\"range-constraint-query\":"
					+ "{\"constraint-name\":\"lastActivity\", "
					+ "\"value\":\"2015-08-09T18:16:56.809Z\", "
					+ "\"range-operator\":\"GT\"}}}", JsonNode.class);
			results = qnaService.rawSearch(ClientRole.SAMPLESTACK_CONTRIBUTOR,
					query, 1);

			logger.debug("Query Results:" + mapper.writeValueAsString(results));

			logger.debug("Query Text:"
					+ mapper.writeValueAsString(results.get("report")));
		} catch (IOException e) {
			throw new SamplestackIOException(e);
		}
		assertEquals("JSON has 0 result", 11, results.get("total").asInt());

		try {
			query = (ObjectNode) mapper.readValue("{\"query\":"
					+ "{\"range-constraint-query\":"
					+ "{\"constraint-name\":\"lastActivity\", "
					+ "\"value\":\"2015-08-09T18:16:56.809Z\", "
					+ "\"range-operator\":\"LT\"}}}", JsonNode.class);
			results = qnaService.rawSearch(ClientRole.SAMPLESTACK_CONTRIBUTOR,
					query, 1, true);

			logger.debug("Query Results:" + mapper.writeValueAsString(results));

			logger.debug("Query Text:"
					+ mapper.writeValueAsString(results.get("report")));
		} catch (IOException e) {
			throw new SamplestackIOException(e);
		}
		assertTrue("JSON has >0 result", results.get("total").asInt() > 0);

	}

	@Test
	@Ignore
	// this is tested in Java Client API now. takes some time, so ignoring.
	public void make105Requests() throws JsonProcessingException {
		for (int i = 0; i < 105; i++) {
			logger.debug("Running many queries... " + i);
			testActivitySearch();
		}
	}

}
