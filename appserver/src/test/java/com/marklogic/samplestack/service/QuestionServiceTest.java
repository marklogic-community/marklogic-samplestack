package com.marklogic.samplestack.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.util.UUID;

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
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.IntegrationTest;
import com.marklogic.samplestack.Utils;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.domain.QnADocumentResults;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = {Application.class })
@Category(IntegrationTest.class)
public class QuestionServiceTest {


	private final Logger logger = LoggerFactory.getLogger(QuestionServiceTest.class);
	
	@Autowired
	QnAService service;

	@Autowired
	ObjectMapper mapper;
	
	@Test
	public void testAskAndAnswerFlow() {
		
		// check for existing answers with a naive question
		String question = "How do I get to know MarkLogic quickly?";
		
		// TODO 'question syntax'
		
		// first step -- send question to the server, get back results
		QnADocumentResults results = service.search(question);
		
		logger.debug("Results came back " + results.getResults().getTotalResults());
		assertEquals("Nothing in the database yet to match results", 0, results.getResults().getTotalResults());

		QnADocument newQuestion = new QnADocument(mapper, question, "I mean, there are several reasons. \n* bullet\n*bullet And so it goes.");
		// ask a question.
		QnADocument submittedQuestionAndAnswer = service.ask(Utils.joeUser, newQuestion);

		assertEquals(newQuestion.getJson().get("title"), submittedQuestionAndAnswer.getJson().get("title"));
		
		// search for my original question.
		QnADocumentResults myQuestionsAndAnswers = service.search(question);
		QnADocument myQuestionCameBack = myQuestionsAndAnswers.get(0);
		assertEquals(newQuestion.getJson().get("title"), myQuestionCameBack.getJson().get("title"));

		// TODO somehow assert the question I just asked is in this list?
		submittedQuestionAndAnswer = service.answer(Utils.maryUser, submittedQuestionAndAnswer, "I think your question is very good.");
		
		//Answer answer = submittedQuestionAndAnswer.getAnswers().get(0);
		
		// need security for this method to make sure asker acks the
		service.accept(Utils.joeUser,"1");
	}
	
	
	
	@Test
	// TODO
	// this test relies on the current (facade) JSON support in REST API
	// 
	public void testCRUD() throws JsonProcessingException {
		QnADocument question = new QnADocument(mapper, "What is my first question?", "Its body is suspiciously short, like a unit test's.");
		Contributor joeUser = Utils.getBasicUser();
		joeUser.setDisplayName("joeUser");
		joeUser.setId(UUID.randomUUID());
		
		QnADocument question2 = service.ask(joeUser,  question);
		
		logger.debug(mapper.writeValueAsString(question2.getJson()));
		
		assertEquals("Persisted question", "What is my first question?",  question2.getJson().get("title").asText());
		assertNotNull("Persisted question has ts",  question2.getJson().get("creationDate"));
		
	}
}
