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
package com.marklogic.samplestack.integration.web;


import static org.junit.Assert.assertEquals;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.util.List;

import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.SamplestackConstants.ISO8601Formatter;
import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.testing.IntegrationTests;
import com.marklogic.samplestack.testing.QnADocumentControllerTestImpl;
import com.marklogic.samplestack.testing.TestDataManager;
import com.marklogic.samplestack.testing.Utils;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@SpringApplicationConfiguration(classes = { Application.class, TestDataManager.class })
@Category(IntegrationTests.class)
public class QnADocumentControllerIT extends QnADocumentControllerTestImpl {

	private Date deleteSince = null;
	
	@Before
	public void storeTimestamp() {
		deleteSince = new Date();
	}

	@After
	public void cleanupEachTest() throws JsonParseException, JsonMappingException, IOException {
		ObjectNode combinedQuery = mapper.readValue(new ClassPathResource("queries/clean-range.json").getInputStream(), ObjectNode.class);
		ObjectNode rangeQueryNode = (ObjectNode) combinedQuery.get("search").get("query").get("range-query");
		rangeQueryNode.put("value", ISO8601Formatter.format(deleteSince));

		ObjectNode joesQuestions = qnaService.rawSearch(ClientRole.SAMPLESTACK_CONTRIBUTOR, combinedQuery, 1);
		List<String> toDelete = joesQuestions.findValuesAsText("id");
		for (String d : toDelete) {
			logger.debug("Cleaning up from qnatests " + d);
			qnaService.delete(d);
		}
	}

	@Override
    @Test
	public void testAnonymousCanSearch() throws UnsupportedEncodingException,
			Exception {
                super.testAnonymousCanSearch();
	}


	@Override
    @Test
	public void testLoggedInCanSearch() throws UnsupportedEncodingException,
			Exception {
                super.testLoggedInCanSearch();
	}
	
	@Override
	@Test
	public void testAnonymousCannotAsk() throws JsonProcessingException,
			Exception {
		super.testAnonymousCannotAsk();
	}

	@Override
	@Test
	public void testAskMalformedQuestions() throws JsonProcessingException,
			Exception {
		super.testAskMalformedQuestions();
	}

	@Override
	@Test
	public void testAskQuestion() throws JsonProcessingException, Exception {
		super.testAskQuestion();
	}


	@Override
	@Test
	public void testAnswerQuestion() throws Exception {
		super.testAnswerQuestion();
	}

	@Override
	@Test
	public void commentOnAnswer() throws Exception {
		super.commentOnAnswer();
		super.badUrlCommentThrows404();
	}

	@Test
	public void testVoteUpQuestion() throws Exception {
		JsonNode upvotedDocument = super.voteUpQuestion();
		ArrayNode questionUpVotes = (ArrayNode) upvotedDocument.get("upvotingContributorIds");
		assertEquals("When a voter has upvoted, its result should have a record of [only] my upvote.", 1, questionUpVotes.size());
		assertEquals("The single downvoter is the voter", Utils.testC1.getId(), questionUpVotes.get(0).asText());
	}

	@Test
	public void testVoteDownQuestion() throws Exception {
		JsonNode downvotedDocument = super.voteDownQuestion();
		ArrayNode questionDownVotes = (ArrayNode) downvotedDocument.get("downvotingContributorIds");
		assertEquals("When a voter has downvoted, its result should have a record of [only] my upvote.", 1, questionDownVotes.size());
		assertEquals("The single downvoter is the voter", Utils.testC1.getId(), questionDownVotes.get(0).asText());
	}

	@Test
	// this test is a little more rigorous than the others -- it actually
	// verifies that there are two upvotes on the answer before stripping
	// to just A1.
	public void testVoteUpAnswer() throws Exception {
		JsonNode upvotedDocument = super.voteUpAnswer();
		ArrayNode answerUpVotes = (ArrayNode) upvotedDocument.get("answers").get(0).get("upvotingContributorIds");
		logger.debug("UPVOTES" + mapper.writeValueAsString(answerUpVotes));
		assertEquals("When a voter has upvoted, its result should have a record of [only] my upvote.", 1, answerUpVotes.size());
		assertEquals("The single upvoter is the voter", Utils.testA1.getId(), answerUpVotes.get(0).asText());
	}

	@Test
	public void testVoteDownAnswer() throws Exception {
		JsonNode downvotedDocument = super.voteDownAnswer();
		ArrayNode answerDownVotes = (ArrayNode) downvotedDocument.get("answers").get(0).get("downvotingContributorIds");
		assertEquals("When a voter has downvoted, its result should have a record of [only] my downvote.", 1, answerDownVotes.size());
		assertEquals("The single downvoter is the voter", Utils.testC1.getId(), answerDownVotes.get(0).asText());
	}

	@Override
	@Test
	public void testAcceptAnswer() throws Exception {
		super.testAcceptAnswer();
	}

	@Override
	@Test
	public void testAnonymousAccessToAccepted() throws Exception {
		super.testAnonymousAccessToAccepted();
	}

	@Test
	public void testIncludeTimezoneAdjustsDateFacet() throws JsonProcessingException, Exception {
		//logger.debug("" + DateTimeZone.getAvailableIDs());
		MockHttpServletResponse response = super.testIncludeTimezone("queries/test-timezone-query.json");
		ObjectNode searchResponse = mapper.readValue(response.getContentAsString(), ObjectNode.class);
		JsonNode dateFacet = searchResponse.get("facets").get("date");
		logger.debug(mapper.writeValueAsString(dateFacet));
		DateTime firstValue = DateTime.parse(dateFacet.get("facetValues").get(0).get("value").asText());
		DateTimeZone timeZone = firstValue.getChronology().getZone();
		assertEquals("Time zone must match that requested in payload", "-08:00", timeZone.getID());
		
		response = super.testIncludeTimezone("queries/test-timezone-query2.json");
		searchResponse = mapper.readValue(response.getContentAsString(), ObjectNode.class);
		dateFacet = searchResponse.get("facets").get("date");
		logger.debug(mapper.writeValueAsString(dateFacet));
		firstValue = DateTime.parse(dateFacet.get("facetValues").get(0).get("value").asText());
		timeZone = firstValue.getChronology().getZone();
		assertEquals("Time zone must match that requested in payload", "+01:00", timeZone.getID());
		
		super.testBadTimezone();
	}
}
