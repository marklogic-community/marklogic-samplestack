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
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.io.IOException;
import java.util.Date;
import java.util.List;

import org.joda.time.DateTimeZone;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.SamplestackConstants.ISO8601Formatter;
import com.marklogic.samplestack.dbclient.DatabaseContext;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.InitialQuestion;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.service.QnAService;
import com.marklogic.samplestack.testing.IntegrationTests;
import com.marklogic.samplestack.testing.TestDataManager;
import com.marklogic.samplestack.testing.Utils;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = { DatabaseContext.class, TestDataManager.class})
@Category(IntegrationTests.class)
public class QnAServiceIT extends MarkLogicIntegrationIT {

	private final Logger logger = LoggerFactory.getLogger(QnAServiceIT.class);

	@Autowired
	QnAService service;

	@Autowired
	ObjectMapper mapper;

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

	
	@Test
	/**
	 * In this test we exercise the search/ask/answer/accept flow
	 * @throws JsonProcessingException
	 */
	public void testAskAndAnswerFlow() throws JsonProcessingException {

		// a fresh question
		InitialQuestion newQuestion;
		// state after submission
		QnADocument submittedQuestionAndAnswer;
		// same document, having searched for it
		QnADocument questionFromSearch;
		// state after answering
		QnADocument answeredQuestion;
		// state after two answers
		QnADocument answeredTwiceQuestion;

		// state after acceptance
		QnADocument acceptedQuestion;

		// check for existing answers with a naive question
		String question = "How do I get to know MarkLogic quickly";

		// first step -- send question to the server, get back results
		// TODO expand this first step.
		service.findOne(ClientRole.SAMPLESTACK_CONTRIBUTOR, question, 1, null);

		newQuestion = Utils.newQuestion();
		
		// ask a question.
		submittedQuestionAndAnswer = service.ask(Utils.testC1,
				newQuestion);

		assertEquals(newQuestion.getAnswers().length,
				submittedQuestionAndAnswer.getJson().get("answers").size());
		assertEquals(newQuestion.getComments().length,
				submittedQuestionAndAnswer.getJson().get("comments").size());
		assertEquals(newQuestion.getTitle(),
				submittedQuestionAndAnswer.getJson().get("title").asText());
		assertEquals(newQuestion.getTags().length,
				submittedQuestionAndAnswer.getJson().get("tags").size());

		String lastActivityString = ISO8601Formatter.format(newQuestion.getLastActivityDate());
		assertEquals(lastActivityString,
				submittedQuestionAndAnswer.getJson().get("lastActivityDate").asText());
		String creationString = ISO8601Formatter.format(newQuestion.getCreationDate());
		assertEquals(creationString,
				submittedQuestionAndAnswer.getJson().get("creationDate").asText());
		assertEquals(newQuestion.getText(),
				submittedQuestionAndAnswer.getJson().get("text").asText());
		assertEquals(newQuestion.getOwner().getId(),
				submittedQuestionAndAnswer.getJson().get("owner").get("id").asText());
		

		// search for my original question.
		questionFromSearch = service.findOne(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, question, 1, null);

		logger.info(mapper.writeValueAsString(questionFromSearch));
		assertEquals("Title was set properly on ingested question", newQuestion
				.getTitle(),
				questionFromSearch.getJson().get("title").asText());

		JsonNode ownerNode = questionFromSearch.getJson().get("owner");
		assertEquals("The question has an owner/userName",
				Utils.testC1.getUserName(), ownerNode.get("userName").asText());

		// TODO somehow assert the question I just asked is in this list?
		// Mary answers the question.
		answeredQuestion = service.answer(Utils.testA1,
				submittedQuestionAndAnswer.getId(),
				"I think your question is very good.");

		logger.debug(mapper.writeValueAsString(answeredQuestion));

		JsonNode answer = answeredQuestion.getJson().get("answers").get(0);
		
		assertEquals("answered question has an answer",
				Utils.testA1.getUserName(),
				answer.get("owner").get("userName").asText());
		
		assertFalse("answer has creationDate", 
				answer.get("creationDate").isNull());
		
		assertFalse("The question has updated lastActivity Date",
				lastActivityString.equals(answeredQuestion.getJson().get("lastActivityDate").asText()));
		lastActivityString = answeredQuestion.getJson().get("lastActivityDate").asText();
		
		// joe answers the question. add another answer
		answeredTwiceQuestion = service
				.answer(Utils.testC1, answeredQuestion.getId(),
						"I think the question has merit, but is inherently unanswerable.");
		assertEquals("twice answered question has two answers", 2,
				answeredTwiceQuestion.getJson().get("answers").size());
		
		assertFalse("The question has updated lastActivity Date",
				lastActivityString.equals(answeredTwiceQuestion.getJson().get("lastActivityDate").asText()));
		lastActivityString = answeredTwiceQuestion.getJson().get("lastActivityDate").asText();
		
		String firstAnswerId = answer.get("id").asText();
		String secondAnswerId = answeredTwiceQuestion.getJson().get("answers")
				.get(1).get("id").asText();

		Contributor testA1 = contributorService.getByUserName("testA1@example.com");
		int marysReputation = testA1.getReputation();
		acceptedQuestion = service.accept(null, firstAnswerId);
		
		assertEquals("Accepted answer id is correct", firstAnswerId,
				acceptedQuestion.getJson().get("acceptedAnswerId").asText());
		
		assertTrue("The question is marked as accepted", acceptedQuestion
				.getJson().get("accepted").asBoolean());
		
		testA1 = contributorService.getByUserName("testA1@example.com");
		
		assertEquals("Owner of accepted question got reputation boost", marysReputation + 1, testA1.getReputation() );
		
		assertFalse("The question has updated lastActivity Date",
				lastActivityString.equals(acceptedQuestion.getJson().get("lastActivityDate").asText()));
		lastActivityString = acceptedQuestion.getJson().get("lastActivityDate").asText();
		
		Contributor testC1 = contributorService.getByUserName("testC1@example.com");
		int joesReputation = testC1.getReputation();
		
		// accept another answer
		acceptedQuestion = service.accept(null, secondAnswerId);
		assertEquals("Accepted answer id is correct", secondAnswerId,
				acceptedQuestion.getJson().get("acceptedAnswerId").asText());
		assertTrue("The question is marked as accepted", acceptedQuestion
				.getJson().get("accepted").asBoolean());
		
		testA1 = contributorService.getByUserName("testA1@example.com");
		testC1 = contributorService.getByUserName("testC1@example.com");
		
		assertFalse("The question has updated lastActivity Date",
				lastActivityString.equals(acceptedQuestion.getJson().get("lastActivityDate").asText()));
		
		assertEquals("Owner of accepted question got reputation boost", joesReputation + 1, testC1.getReputation() );

		assertEquals("Owner of previously accepted question got reputation decrement", marysReputation, testA1.getReputation() );

		
	}

	@Test
	public void testVoting() throws JsonProcessingException {
		InitialQuestion newQuestion = new InitialQuestion();
		newQuestion.setTitle("How does voting work?");
		newQuestion.setText("I want lots of up votes on my document");
		newQuestion.setTags(new String[] {"voting", "votes"});
		QnADocument submitted = service.ask(Utils.testC1,
				newQuestion);

		int voteCount = submitted.getJson().get("voteCount").asInt();

		QnADocument answered = service
				.answer(Utils.testA1, submitted.getId(),
						"I think your question is very good.  I want lots of votes too.");
		String answerId = answered.getJson().get("answers").get(0).get("id")
				.asText();

		// vote up
		Contributor preC1, preA1;
		preC1 = contributorRepository.read(Utils.testC1.getId());
		preA1 = contributorRepository.read(Utils.testA1.getId());
		int testC1Reputation = preC1.getReputation();
		int testA1Reputation = preA1.getReputation();
		long c1Votes = preC1.getVoteCount();
		long a1Votes = preA1.getVoteCount();
		
		logger.debug("A1Votes is " + a1Votes);
		// a1 votes c1 question up, reputation +1 for c1.
		// a1 hasVotedOn submitted.
		service.voteUp(Utils.testA1, submitted.getId());
		
		QnADocument votedOn = service.get(ClientRole.SAMPLESTACK_CONTRIBUTOR,
				Utils.testA1, submitted.getId());
		int newScore = votedOn.getJson().get("voteCount").asInt();
		assertEquals("Vote score should be one higher than before", voteCount + 1, newScore);

		try {
			service.voteUp(Utils.testA1, submitted.getId());
			fail("Same person cannot vote twice on same post");
		} catch (Exception e) {
			// pass
		}
		try {
			service.voteUp(Utils.testA1, submitted.getId());
			fail("Same person cannot vote twice on same post");
		} catch (Exception e) {
			// pass
		}

		// c1 votes a1 answer down, her rep should be -1
		// c1 hasVotedOn answerId
		service.voteDown(contributorService.getByUserName("testC1@example.com"), answerId);
		QnADocument votedTwiceOn = service.get(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, Utils.testC1, submitted.getId());
		int newerScore = votedTwiceOn.getJson().get("voteCount").asInt();
		assertEquals("Vote score should be one higher than before",
				newScore - 1, newerScore);

		Contributor c1State = contributorRepository.read(Utils.testC1.getId());
		Contributor a1State = contributorRepository.read(Utils.testA1.getId());
		logger.debug("PREA1" + mapper.writeValueAsString(preA1));
		logger.debug("AfterA1" + mapper.writeValueAsString(a1State));
		
		logger.debug("Before, votecount was " + a1Votes +".  Now its " + a1State.getVoteCount() );

		assertEquals("c1 has voted once", c1Votes + 1, c1State.getVoteCount());
		assertEquals("c1 reputation has gained", testC1Reputation + 1, c1State.getReputation());
		
		assertEquals("a1 has voted once", a1Votes + 1, a1State.getVoteCount());
		assertEquals("a1 reputation has suffered", testA1Reputation - 1, a1State.getReputation());

	}

	@Test
	public void testCommentsAndSearch() throws JsonProcessingException {
		testComments();
		testDefaultSearchService();
		testDateFacets();
	}
	
	
	public void testComments() {
		InitialQuestion newQuestion = new InitialQuestion();
		newQuestion.setTitle("How do comments work?");
		newQuestion.setText("I could go on and on but would rather solicit commentary");
		newQuestion.setTags(new String[] {"commentary"});
		QnADocument submitted = service.ask(Utils.testC1,
				newQuestion);

		QnADocument answered = service.answer(Utils.testA1,
				submitted.getId(), "I think your question is very good.");

		String answerId = answered.getJson().get("answers").get(0).get("id")
				.asText();

		String c1 = "Here's ONE comment on your question";
		String c2 = "Here's TWO comment on your question";
		String c3 = "Here's ONE comment on your answer";

		service.comment(Utils.testC1,
				submitted.getId(), c1);
		service.comment(Utils.testC1,
				submitted.getId(), c2);

		QnADocument finalDocument = service.comment(
				Utils.testC1, answerId, c3);

		assertEquals("Comment 1", c1, finalDocument.getJson().get("comments")
				.get(0).get("text").asText());
		assertEquals("Comment 2", c2, finalDocument.getJson().get("comments")
				.get(1).get("text").asText());
		assertEquals("Comment 3", c3, finalDocument.getJson().get("answers")
				.get(0).get("comments").get(0).get("text").asText());
	}

	
	@Test
	public void testCRUD() throws JsonProcessingException {
		InitialQuestion newQuestion = new InitialQuestion();
		newQuestion.setTitle("What is my first question?");
		newQuestion.setText("Its body is suspiciously short, like a unit test's.");
		newQuestion.setTags(new String[] {"tag1", "tag2"});
		Contributor testC1 = Utils.testC1;

		QnADocument question2 = service.ask(testC1, newQuestion);

		logger.debug(mapper.writeValueAsString(question2.getJson()));

		assertEquals("Persisted question", "What is my first question?",
				question2.getJson().get("title").asText());
		assertFalse("Persisted question has ts",
				question2.getJson().get("creationDate").isNull());
		assertFalse("Persisted question has last activity",
				question2.getJson().get("lastActivityDate").isNull());

	}

	/* run by testCommentsAndSearch */
	public void testDefaultSearchService() throws JsonProcessingException {
		
		ObjectNode structuredQuery = getTestJson("queries/blank.json");
		// test view-all
		ObjectNode jsonResults = service.rawSearch(ClientRole.SAMPLESTACK_CONTRIBUTOR, structuredQuery, 1);

		logger.info(mapper.writeValueAsString(jsonResults));
		assertTrue("Blank query got back results", jsonResults.get("results")
				.size() > 0);
		assertEquals("Blank query got back facets (no date)", 1, jsonResults
				.get("facets").size());
		assertNull("Blank query shouldn't retrieve date facet",
				jsonResults.get("facets").get("date"));
		assertNotNull("Blank query got back tag facet",
				jsonResults.get("facets").get("tag"));

	}
	
	/* run by testCommentsAndSearch */
	public void testDateFacets() throws JsonProcessingException {
		
		ObjectNode structuredQuery = getTestJson("queries/blank.json");
		// test view-all
		ObjectNode jsonResults = service.rawSearch(ClientRole.SAMPLESTACK_CONTRIBUTOR, structuredQuery, 1, DateTimeZone.forID("US/Pacific"));
		logger.info(mapper.writeValueAsString(jsonResults));
		assertTrue("Blank query got back results", jsonResults.get("results")
				.size() > 0);
		assertEquals("Blank query got back facets", 2, jsonResults
				.get("facets").size());
		assertNotNull("Blank query got back date facet",
				jsonResults.get("facets").get("date"));
		assertNotNull("Blank query got back tag facet",
				jsonResults.get("facets").get("tag"));
		assertNotNull("Blank query got back tag facet period",
				jsonResults.get("facets").get("date").get("period"));
	}
}
