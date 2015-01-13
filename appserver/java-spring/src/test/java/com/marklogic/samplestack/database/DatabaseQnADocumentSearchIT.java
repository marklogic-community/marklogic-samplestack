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
package com.marklogic.samplestack.database;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.util.Iterator;

import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.format.ISODateTimeFormat;
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
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.dbclient.Clients;
import com.marklogic.samplestack.dbclient.DatabaseContext;
import com.marklogic.samplestack.dbclient.MarkLogicQnAService;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.exception.SamplestackIOException;
import com.marklogic.samplestack.security.ClientRole;
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
		ObjectNode queryNode = query.putObject("search");
		ArrayNode qtext = queryNode.putArray("qtext");
		qtext.add("tag:test-data-tag sort:active");  // the controller tier adds this if no query specified
		ObjectNode results = qnaService.rawSearch(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, query, 1, null);
		assertTrue("Need data to test searches", results.size() > 0);

		ArrayNode resultsArray = (ArrayNode) results.get("results");
		DateTime lastActivityDate = null;
		for (int i=0; i < resultsArray.size();i++) {
			String nextLastActivityDateString = resultsArray.get(i).get("content").get("lastActivityDate").asText();
			DateTime nextLastActivityDate = ISODateTimeFormat.dateTime().parseDateTime(nextLastActivityDateString);
			if (lastActivityDate == null) {
				// skip first
			} else {
			   assertTrue("Date sort out of order", lastActivityDate.isAfter(nextLastActivityDate));
			}
			lastActivityDate = nextLastActivityDate;
		}
	}

	@Test
	public void guestSearchSeesOnlyResolvedQuestions() {
		ObjectNode query = mapper.createObjectNode();
		ObjectNode queryNode = query.putObject("search");
		queryNode.put("qtext", "tag:test-data-tag");
		ObjectNode results = qnaService.rawSearch(ClientRole.SAMPLESTACK_GUEST,
				query, 1, null);
		assertEquals("Guest sees only approved docs", results.get("results")
				.size(), 2);
	}

	@Test
	public void authenticatedSearchSeesUnresolvedQuestions() {
		ObjectNode query = mapper.createObjectNode();
		ObjectNode searchNode = query.putObject("search");
		searchNode.put("qtext", "tag:test-data-tag");
		ObjectNode results = qnaService.rawSearch(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, searchNode, 1, null);
		assertEquals("Logged-in user sees all docs in page", results.get("results")
				.size(), 10);
	}

	@Test
	public void testSingleGetTransform() throws JsonProcessingException {
		QnADocument doc = qnaService.get(ClientRole.SAMPLESTACK_CONTRIBUTOR, null, "01600486-60ea-4557-bcfc-9c10b06fb8cd");
		logger.debug("Transformed doc: " + mapper.writeValueAsString(doc.getJson()));
		assertNotNull("Reuptation must be there on a get doc", doc.getJson().get("owner").get("reputation").asLong());
	}
	
	@Test
	public void testConfiguredStringSearches() throws JsonProcessingException {

		ObjectNode docNode = mapper.createObjectNode();
		ObjectNode searchNode = docNode.putObject("search");
		ArrayNode qtexts = searchNode.putArray("qtext");
		qtexts.add("answeredBy:x");
		qtexts.add("commentedBy:y");
		qtexts.add("askedBy:z");
		ObjectNode results = qnaService.rawSearch(ClientRole.SAMPLESTACK_CONTRIBUTOR, docNode, 1, null);
		String resultsString =  mapper.writeValueAsString(results);
		assertTrue(resultsString.contains("path-range-query"));  // if turn off search debug this will fail.
	}

	@SuppressWarnings("unused")
	@Test
	public void testResponseExtracts() throws JsonProcessingException {
		ObjectNode query = mapper.createObjectNode();
		ObjectNode queryNode = query.putObject("search");
		queryNode.put("qtext", "tag:test-data-tag");
		ObjectNode results = qnaService.rawSearch(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, query, 1, null);
		ArrayNode qnaResults = (ArrayNode) results.get("results");
		Iterator<JsonNode> i = qnaResults.iterator();
		assertTrue("Need results to test results.", qnaResults.size() > 0);
		logger.debug(mapper.writeValueAsString(results));
		while (i.hasNext())  {
			JsonNode qnaDoc = i.next();
			for (int j=0; j < qnaResults.size(); j++) {
				ObjectNode resultObject = (ObjectNode) qnaResults.get(j).get("content");
				logger.debug("In results at " + j + " and " + mapper.writeValueAsString(resultObject));
				ObjectNode ownerNode = (ObjectNode) resultObject.get("owner");
				int reputation = ownerNode.get("reputation").asInt();
				ArrayNode snippets = (ArrayNode) resultObject.get("snippets"); //TODO propose use matches
				assertTrue(snippets.size() > 0);
				ObjectNode snippet = (ObjectNode) snippets.get(0);
				ArrayNode matchText = (ArrayNode) snippet.get("match-text");
				String id = snippet.get("id").asText();
				String source = snippet.get("source").asText();
				assertTrue("Source should be question or answer.  Was "+source, source.equals("tags") || source.equals("answer") || source.equals("question"));
			}
			/*
{
    "confidence": 0,
    "content": {
        "accepted": false,
        "creationDate": "2014-10-01T08:59:08.866",
        "id": "5dce8909-0972-4289-93cd-f2e8790a17fb",
        "lastActivityDate": "2014-10-01T08:59:12.230",
        "owner": {
            "displayName": "Mary Admin",
            "id": "9611450a-0663-45a5-8a08-f1c71320475e",
            "reputation": 0,
            "userName": "mary@example.com"
        },
        "snippets": [
            [
                {
                    "match-text": [
                        {
                            "highlight": "test-data-tag"
                        }
                    ],
                    "id":"so1098134",  // Can be used to uniquely identify a node
                    "source":"question" 
                }
            ]
        ],
        "tags": [
            "python",
            "test-data-tag"
        ],
        "title": "Mary's Question Number 1",
        "voteCount": 0
    },
    "fitness": 0,
    "format": "json",
    "href": "/v1/documents?uri=%2Fquestions%2F5dce8909-0972-4289-93cd-f2e8790a17fb.json",
    "index": 1,
    "mimetype": "application/json",
    "path": "fn:doc(\"/questions/5dce8909-0972-4289-93cd-f2e8790a17fb.json\")",
    "score": 0,
    "uri": "/questions/5dce8909-0972-4289-93cd-f2e8790a17fb.json"
}
*/
			logger.debug(mapper.writeValueAsString(qnaDoc));
			
		}
	}

	@Test
	public void testAcceptedSearch() {
		ObjectNode query;
		ObjectNode results = null;
		try {
			query = (ObjectNode) mapper
					.readValue(
							"{\"search\":"
							+ "{\"qtext\":\"tag:test-data-tag\","
							+ " \"query\":{\"value-constraint-query\":{\"constraint-name\":\"resolved\",\"text\":true}}}}",
							JsonNode.class);
			results = qnaService.rawSearch(ClientRole.SAMPLESTACK_CONTRIBUTOR,
					query, 1, null);

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
			query = (ObjectNode) mapper.readValue("{\"search\":"
					+ "{\"qtext\":\"tag:test-data-tag\", "
					+ "\"query\":"
					+ "{\"range-constraint-query\":"
					+ "{\"constraint-name\":\"lastActivity\", "
					+ "\"value\":\"2015-08-09T18:16:56.809Z\", "
					+ "\"range-operator\":\"GT\"}}}}", JsonNode.class);
			results = qnaService.rawSearch(ClientRole.SAMPLESTACK_CONTRIBUTOR,
					query, 1);

			logger.debug("Query Results:" + mapper.writeValueAsString(results));

			logger.debug("Query Text:"
					+ mapper.writeValueAsString(results.get("report")));
		} catch (IOException e) {
			throw new SamplestackIOException(e);
		}
		assertEquals("JSON has 0 result", 0, results.get("total").asInt());

		try {
			query = (ObjectNode) mapper.readValue("{\"search\":"
					+ "{\"query\":"
					+ "{\"range-constraint-query\":"
					+ "{\"constraint-name\":\"lastActivity\", "
					+ "\"value\":\"2014-08-09T18:16:56.809Z\", "
					+ "\"range-operator\":\"LT\"}}}}", JsonNode.class);
			results = qnaService.rawSearch(ClientRole.SAMPLESTACK_CONTRIBUTOR,
					query, 1, DateTimeZone.forID("US/Pacific"));

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
