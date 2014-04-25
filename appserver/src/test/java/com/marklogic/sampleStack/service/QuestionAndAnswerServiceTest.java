package com.marklogic.sampleStack.service;

import static org.junit.Assert.assertEquals;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.sampleStack.Application;
import com.marklogic.sampleStack.Utils;
import com.marklogic.sampleStack.domain.ApplicationUser;
import com.marklogic.sampleStack.domain.QuestionAndAnswerResults;
import com.marklogic.sampleStack.domain.QuestionAndAnswers;
import com.marklogic.sampleStack.domain.QuestionAndAnswers.Answer;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = {Application.class })
public class QuestionAndAnswerServiceTest {

	@Autowired
	QuestionAndAnswerService service;

	@Test
	public void testAnonymousAccess() {

		// check for existing answers with a naive question
		String question = "What should I ask about the Protoalgonquin Language Family?";

		// this might just wrap a SearchHandle. It certainly contains one.
		QuestionAndAnswerResults existingAnswers = service.search(question);

		if (existingAnswers.hasResults()) {
			// maybe I'm satisfied with one of them
		}
		

	}

	@Test
	public void testAskAndAnswer() {
		ApplicationUser joeUser = Utils.getBasicUser();
		joeUser.setDisplayName("joeUser");
		joeUser.setAccountId("1");

		ApplicationUser maryUser = Utils.getBasicUser();
		maryUser.setDisplayName("maryUser");
		maryUser.setAccountId("2");
		

		// check for existing answers with a naive question
		String question = "What should I ask about the Protoalgonquin Language Family?";

		QuestionAndAnswerResults results = service.search("protoalgonquin");
		
		QuestionAndAnswers toAnswer = results.get(0); // maybe

		// ask a question.
		QuestionAndAnswers submittedQuestionAndAnswer = service.ask(joeUser, question);

		assertEquals(submittedQuestionAndAnswer.getQuestion(), question);

		QuestionAndAnswerResults myQuestionsAndAnswers = service
				.search(question);

		// TODO somehow assert the question I just asked is in this list?
		
		submittedQuestionAndAnswer = service.answer(maryUser, toAnswer, "I think your question is very good.");
		
		Answer answer = submittedQuestionAndAnswer.getAnswers().get(0);
		
		// need security for this method to make sure asker acks the
		service.accept(question, answer.getId());
	}
	
}
