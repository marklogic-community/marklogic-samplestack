package com.marklogic.sampleStack.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

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
import com.marklogic.sampleStack.Application;
import com.marklogic.sampleStack.Utils;
import com.marklogic.sampleStack.domain.Contributor;
import com.marklogic.sampleStack.domain.Question;
import com.marklogic.sampleStack.domain.QuestionAndAnswerResults;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = {Application.class })
public class QuestionServiceTest {


	private final Logger logger = LoggerFactory
			.getLogger(QuestionServiceTest.class);
	
	@Autowired
	QuestionService service;

	@Autowired
	ObjectMapper mapper;
	
	
	@Test
	public void testAnonymousAccess() {

		// check for existing answers with a naive question
		String question = "Protoalgonquin";

		// this might just wrap a SearchHandle. It certainly contains one.
		QuestionAndAnswerResults existingAnswers = service.search(question);


		if (existingAnswers.hasResults()) {
			logger.info(existingAnswers.getResults().getMatchResults()[0].getPath());
		} else {
			logger.info("No results from question");
		}
		
	}

	@Test
	@Ignore
	public void testAskAndAnswer() {
		Contributor joeUser = Utils.getBasicUser();
		joeUser.setDisplayName("joeUser");
		joeUser.setId(1L);

		Contributor maryUser = Utils.getBasicUser();
		maryUser.setDisplayName("maryUser");
		maryUser.setId(2L);
		

		// check for existing answers with a naive question
		String question = "What should I ask about the Protoalgonquin Language Family?";
		
		// TODO 'question syntax'
		
		QuestionAndAnswerResults results = service.search("protoalgonquin");
		
		Question toAnswer = results.get(0); // maybe

		Question newQuestion = new Question(mapper, "What the heck?");
		// ask a question.
		Question submittedQuestionAndAnswer = service.ask(joeUser, newQuestion);

		QuestionAndAnswerResults myQuestionsAndAnswers = service
				.search(question);

		// TODO somehow assert the question I just asked is in this list?
		
		submittedQuestionAndAnswer = service.answer(maryUser, toAnswer, "I think your question is very good.");
		
		//Answer answer = submittedQuestionAndAnswer.getAnswers().get(0);
		
		// need security for this method to make sure asker acks the
		service.accept(question,"1");
	}
	
	
	
	@Test
	public void testCRUD() throws JsonProcessingException {
		Question question = new Question(mapper, "What is my first question?");
		Contributor joeUser = Utils.getBasicUser();
		joeUser.setDisplayName("joeUser");
		joeUser.setId(1L);
		
		Question question2 = service.ask(joeUser,  question);
		
		logger.debug(mapper.writeValueAsString(question2.getJson()));
		
		assertEquals("Persisted question", "What is my first question?",  question2.getJson().get("title").asText());
		assertNotNull("Persisted question has ts",  question2.getJson().get("creationDate"));
		
	}
}
