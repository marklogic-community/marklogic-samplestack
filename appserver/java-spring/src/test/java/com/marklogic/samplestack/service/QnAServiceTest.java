package com.marklogic.samplestack.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.Utils;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.domain.QnADocumentResults;
import com.marklogic.samplestack.domain.SamplestackType;
import com.marklogic.samplestack.impl.DatabaseContext;

@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = { DatabaseContext.class })
@Category(MiddleTierIntegrationTest.class)
public class QnAServiceTest extends MarkLogicIntegrationTest {

	private final Logger logger = LoggerFactory.getLogger(QnAServiceTest.class);

	@Autowired
	QnAService service;

	@Autowired
	ObjectMapper mapper;

	@Before
	public void cleanout() {
		operations.deleteDirectory(ClientRole.SAMPLESTACK_CONTRIBUTOR,
				SamplestackType.QUESTIONS);
		contributorService.store(Utils.joeUser);
		contributorService.store(Utils.maryUser);
	}

	@Test
	/**
	 * In this test we exercise the search/ask/answer/accept flow
	 * @throws JsonProcessingException
	 */
	public void testAskAndAnswerFlow() throws JsonProcessingException {

		// a fresh question
		QnADocument newQuestion;
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
		String question = "How do I get to know MarkLogic quickly?";

		// TODO 'question syntax'

		// first step -- send question to the server, get back results
		QnADocumentResults results = service.search(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, question, 1);

//		logger.debug("Results came back "
//				+ results.getResults().getTotalResults());
//		assertEquals("Nothing in the database yet to match results", 0, results
//				.getResults().getTotalResults());

		newQuestion = new QnADocument(
				mapper,
				question,
				"I mean, there are several reasons. \n* bullet\n*bullet And so it goes.",
				"xquery", "javascript", "programming");

		// ask a question.
		submittedQuestionAndAnswer = service.ask(Utils.joeUser.getUserName(),
				newQuestion);

		assertEquals(newQuestion.getJson().get("title"),
				submittedQuestionAndAnswer.getJson().get("title"));
		assertEquals(newQuestion.getJson().get("tags"),
				submittedQuestionAndAnswer.getJson().get("tags"));

		// search for my original question.
		QnADocumentResults myQuestionsAndAnswers = service.search(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, question, 1);
		questionFromSearch = myQuestionsAndAnswers.get(0);

		logger.info(mapper.writeValueAsString(questionFromSearch));
		assertEquals("Title was set properly on ingested question", newQuestion
				.getJson().get("title"),
				questionFromSearch.getJson().get("title"));

		JsonNode ownerNode = questionFromSearch.getJson().get("owner");
		assertEquals("The question has an owner/userName",
				Utils.joeUser.getUserName(), ownerNode.get("userName").asText());

		// TODO somehow assert the question I just asked is in this list?
		answeredQuestion = service.answer(Utils.maryUser.getUserName(),
				submittedQuestionAndAnswer.getId(),
				"I think your question is very good.");

		logger.debug(mapper.writeValueAsString(answeredQuestion));

		JsonNode answer = answeredQuestion.getJson().get("answers").get(0);
		assertEquals("answered question has an answer",
				Utils.maryUser.getUserName(),
				answer.get("owner").get("userName").asText());

		// add another answer
		answeredTwiceQuestion = service
				.answer(Utils.maryUser.getUserName(), answeredQuestion.getId(),
						"I think the question has merit, but is inherently unanswerable.");
		assertEquals("twice answered question has two answers", 2,
				answeredTwiceQuestion.getJson().get("answers").size());

		String firstAnswerId = answer.get("id").asText();
		String secondAnswerId = answeredTwiceQuestion.getJson().get("answers")
				.get(1).get("id").asText();

		acceptedQuestion = service.accept(firstAnswerId);

		assertEquals("Accepted answer id is correct", firstAnswerId,
				acceptedQuestion.getJson().get("acceptedAnswerId").asText());
		assertTrue("The right answer has been accepted", acceptedQuestion
				.getJson().get("answers").get(0).get("accepted").asBoolean());

		// accept another answer
		acceptedQuestion = service.accept(secondAnswerId);
		assertEquals("Accepted answer id is correct", secondAnswerId,
				acceptedQuestion.getJson().get("acceptedAnswerId").asText());
		assertTrue("The right answer has been accepted", acceptedQuestion
				.getJson().get("answers").get(1).get("accepted").asBoolean());

	}

	@Test
	public void testVoting() {
		QnADocument newQuestion = new QnADocument(mapper,
				"How does voting work?",
				"I want lots of up votes on my document",
				"voting", "votes");
		QnADocument submitted = service.ask(Utils.joeUser.getUserName(),
				newQuestion);
		
		int docScore = submitted.getJson().get("docScore").asInt();
		
		QnADocument answered = service.answer(Utils.maryUser.getUserName(),
				submitted.getId(), "I think your question is very good.  I want lots of votes too.");
		String answerId = answered.getJson().get("answers").get(0).get("id")
				.asText();

		service.voteUp(Utils.joeUser.getUserName(), submitted.getId());
		QnADocument votedOn = service.get(ClientRole.SAMPLESTACK_CONTRIBUTOR, submitted.getId());
		int newScore = votedOn.getJson().get("docScore").asInt();
		assertEquals("Vote score should be one higher than before", docScore + 1, newScore);
		
		try {
			service.voteUp(Utils.joeUser.getUserName(), submitted.getId());
			fail("Same person cannot vote twice on same post");
		} catch (Exception e) {
			// pass
		}
		try {
			service.voteDown(Utils.joeUser.getUserName(), submitted.getId());
			fail("Same person cannot vote twice on same post");
		} catch (Exception e) {
			// pass
		}
		
		service.voteDown(Utils.maryUser.getUserName(), answerId);
		QnADocument votedTwiceOn = service.get(ClientRole.SAMPLESTACK_CONTRIBUTOR, submitted.getId());
		int newerScore = votedTwiceOn.getJson().get("docScore").asInt();
		assertEquals("Vote score should be one higher than before", newScore - 1, newerScore);
		
		Contributor joesState = contributorService.get(Utils.joeUser.getId());
		assertEquals("joe has voted once", 1, joesState.getVotes().size());
		assertTrue("joe voted on this", joesState.hasVotedOn(submitted.getId()));


		Contributor marysState = contributorService.get(Utils.maryUser.getId());
		assertEquals("mary has voted once", 1, marysState.getVotes().size());
		assertTrue("mary voted on this", marysState.hasVotedOn(answerId));
		

	}
	

	@Test
	public void testComments() {

		QnADocument newQuestion = new QnADocument(mapper,
				"How do comments work?",
				"I could go on and on but would rather solicit commentary",
				"commentary");

		QnADocument submitted = service.ask(Utils.joeUser.getUserName(),
				newQuestion);
		QnADocument answered = service.answer(Utils.maryUser.getUserName(),
				submitted.getId(), "I think your question is very good.");

		String answerId = answered.getJson().get("answers").get(0).get("id")
				.asText();

		String c1 = "Here's ONE comment on your question";
		String c2 = "Here's TWO comment on your question";
		String c3 = "Here's ONE comment on your answer";

		QnADocument one = service.comment(Utils.joeUser.getUserName(),
				submitted.getId(), c1);
		QnADocument two = service.comment(Utils.joeUser.getUserName(),
				submitted.getId(), c2);

		QnADocument finalDocument = service.comment(
				Utils.joeUser.getUserName(), answerId, c3);

		assertEquals("Comment 1", c1,
				finalDocument.getJson().get("comments").get(0).get("text")
						.asText());
		assertEquals("Comment 2", c2,
				finalDocument.getJson().get("comments").get(1).get("text")
						.asText());
		assertEquals("Comment 3", c3,
				finalDocument.getJson().get("answers").get(0).get("comments").get(0).get("text")
						.asText());
	}

	@Ignore
	@Test
	public void testReputation() {
		fail("Not implemented");
	}

	@Test
	public void testCRUD() throws JsonProcessingException {
		QnADocument question = new QnADocument(mapper,
				"What is my first question?",
				"Its body is suspiciously short, like a unit test's.", "tag1",
				"tag2");
		Contributor joeUser = Utils.joeUser;

		QnADocument question2 = service.ask(joeUser.getUserName(), question);

		logger.debug(mapper.writeValueAsString(question2.getJson()));

		assertEquals("Persisted question", "What is my first question?",
				question2.getJson().get("title").asText());
		assertNotNull("Persisted question has ts",
				question2.getJson().get("creationDate"));

	}
	
	@Test
	public void testDefaultSearchService() throws JsonProcessingException {
		testComments();  // get a document in there.
		JsonNode structuredQuery = getTestJson("queries/blank.json");
		// test view-all
		ObjectNode jsonResults = service.rawSearch(ClientRole.SAMPLESTACK_CONTRIBUTOR, structuredQuery, 1);
		
		logger.info(mapper.writeValueAsString(jsonResults));
		assertTrue("Blank query got back results", jsonResults.get("results").size() > 0);
		assertEquals("Blank query got back facets", 2, jsonResults.get("facets").size());
		assertNotNull("Blank query got back date facet", jsonResults.get("facets").get("date"));
		assertNotNull("Blank query got back tag facet", jsonResults.get("facets").get("tag"));

	}
}
