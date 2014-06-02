package com.marklogic.samplestack.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.util.UUID;

import org.junit.Ignore;
import org.junit.Test;
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
import com.marklogic.samplestack.Utils;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.domain.QnADocumentResults;
import com.marklogic.samplestack.service.QnAService;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = {Application.class })
public class QuestionServiceTest {


	private final Logger logger = LoggerFactory
			.getLogger(QuestionServiceTest.class);
	
	@Autowired
	QnAService service;

	@Autowired
	ObjectMapper mapper;
	
	
	@Test
	public void testAnonymousAccess() {

		// check for existing answers with a naive question
		String question = "Protoalgonquin";

		// this might just wrap a SearchHandle. It certainly contains one.
		QnADocumentResults existingAnswers = service.search(question);


		if (existingAnswers.hasResults()) {
			logger.info(existingAnswers.getResults().getMatchResults()[0].getPath());
		} else {
			logger.info("No results from question");
		}
		
	}

	@Test
	@Ignore
	public void testAskAndAnswer() {
		
		

		// check for existing answers with a naive question
		String question = "What should I ask about the Protoalgonquin Language Family?";
		
		// TODO 'question syntax'
		
		QnADocumentResults results = service.search("protoalgonquin");
		
		QnADocument toAnswer = results.get(0); // maybe

		QnADocument newQuestion = new QnADocument(mapper, "What the heck?");
		// ask a question.
		QnADocument submittedQuestionAndAnswer = service.ask(Utils.joeUser, newQuestion);

		QnADocumentResults myQuestionsAndAnswers = service
				.search(question);

		// TODO somehow assert the question I just asked is in this list?
		
		submittedQuestionAndAnswer = service.answer(Utils.maryUser, toAnswer, "I think your question is very good.");
		
		//Answer answer = submittedQuestionAndAnswer.getAnswers().get(0);
		
		// need security for this method to make sure asker acks the
		service.accept(Utils.joeUser,"1");
	}
	
	
	
	@Test
	// TODO
	// this test relies on the current (facade) JSON support in REST API
	// 
	public void testCRUD() throws JsonProcessingException {
		QnADocument question = new QnADocument(mapper, "What is my first question?");
		Contributor joeUser = Utils.getBasicUser();
		joeUser.setDisplayName("joeUser");
		joeUser.setId(UUID.randomUUID());
		
		QnADocument question2 = service.ask(joeUser,  question);
		
		logger.debug(mapper.writeValueAsString(question2.getJson()));
		
		assertEquals("Persisted question", "What is my first question?",  question2.getJson().get("title").asText());
		assertNotNull("Persisted question has ts",  question2.getJson().get("creationDate"));
		
	}
}
