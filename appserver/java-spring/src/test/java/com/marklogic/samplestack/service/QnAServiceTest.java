package com.marklogic.samplestack.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import org.junit.Before;
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
import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.domain.QnADocumentResults;
import com.marklogic.samplestack.exception.SamplestackSecurityException;
import com.marklogic.samplestack.testing.IntegrationTest;
import com.marklogic.samplestack.testing.Utils;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = {Application.class })
@Category(IntegrationTest.class)
public class QnAServiceTest  extends MarkLogicIntegrationTest {


	private final Logger logger = LoggerFactory.getLogger(QnAServiceTest.class);
	
	@Autowired
	QnAService service;

	@Autowired
	ObjectMapper mapper;
	
	@Before
	public void cleanout() {
		operations.deleteDirectory(ClientRole.SAMPLESTACK_CONTRIBUTOR, "/questions/");
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
		QnADocumentResults results = service.search(ClientRole.SAMPLESTACK_CONTRIBUTOR, question);
		
		logger.debug("Results came back " + results.getResults().getTotalResults());
		assertEquals("Nothing in the database yet to match results", 0, results.getResults().getTotalResults());

		newQuestion = new QnADocument(mapper, 
				question, 
				"I mean, there are several reasons. \n* bullet\n*bullet And so it goes.", 
				"xquery", "javascript", "programming");
		
		// ask a question.
		submittedQuestionAndAnswer = service.ask(Utils.joeUser.getUserName(), newQuestion);

		assertEquals(newQuestion.getJson().get("title"), submittedQuestionAndAnswer.getJson().get("title"));
		assertEquals(newQuestion.getJson().get("tags"),  submittedQuestionAndAnswer.getJson().get("tags"));
		
		// search for my original question.
		QnADocumentResults myQuestionsAndAnswers = service.search(ClientRole.SAMPLESTACK_CONTRIBUTOR, question);
		questionFromSearch = myQuestionsAndAnswers.get(0);
		
		logger.info(mapper.writeValueAsString(questionFromSearch));
		assertEquals("Title was set properly on ingested question", newQuestion.getJson().get("title"), questionFromSearch.getJson().get("title"));
		
		JsonNode ownerNode = questionFromSearch.getJson().get("owner");
		assertEquals("The question has an owner/userName", Utils.joeUser.getUserName(), ownerNode.get("userName").asText());
		
		// TODO somehow assert the question I just asked is in this list?
		answeredQuestion = service.answer(Utils.maryUser, submittedQuestionAndAnswer.getId(), "I think your question is very good.");
		
		logger.debug(mapper.writeValueAsString(answeredQuestion));
		
	  	JsonNode answer = answeredQuestion.getJson().get("answers").get(0);
		assertEquals("answered question has an answer", Utils.maryUser.getUserName(), answer.get("owner").get("userName").asText());
		
		// add another answer
		answeredTwiceQuestion = service.answer(Utils.maryUser, answeredQuestion.getId(), "I think the question has merit, but is inherently unanswerable.");
		assertEquals("twice answered question has two answers", 2, answeredTwiceQuestion.getJson().get("answers").size());
		
		String firstAnswerId = answer.get("id").asText();
		String secondAnswerId = answeredTwiceQuestion.getJson().get("answers").get(1).get("id").asText();
		
		acceptedQuestion = service.accept(firstAnswerId);
		
		
		assertEquals("Accepted answer id is correct", firstAnswerId, acceptedQuestion.getJson().get("acceptedAnswerId").asText());
		assertTrue("The right answer has been accepted", acceptedQuestion.getJson().get("answers").get(0).get("accepted").asBoolean());
		
		// accept another answer
		acceptedQuestion = service.accept(secondAnswerId);
		assertEquals("Accepted answer id is correct", secondAnswerId, acceptedQuestion.getJson().get("acceptedAnswerId").asText());
		assertTrue("The right answer has been accepted", acceptedQuestion.getJson().get("answers").get(1).get("accepted").asBoolean());
		
		
		//Answer answer = submittedQuestionAndAnswer.getAnswers().get(0);
		
		// need security for this method to make sure asker acks the
		//service.accept(Utils.joeUser,"1");
	}
	
	@Test
	public void testVoting() {
		
	}
	
	
	@Test
	public void testCRUD() throws JsonProcessingException {
		QnADocument question = new QnADocument(mapper, "What is my first question?", "Its body is suspiciously short, like a unit test's.", "tag1", "tag2");
		Contributor joeUser = Utils.joeUser;
		
		QnADocument question2 = service.ask(joeUser.getUserName(),  question);
		
		logger.debug(mapper.writeValueAsString(question2.getJson()));
		
		assertEquals("Persisted question", "What is my first question?",  question2.getJson().get("title").asText());
		assertNotNull("Persisted question has ts",  question2.getJson().get("creationDate"));
		
	}
}
