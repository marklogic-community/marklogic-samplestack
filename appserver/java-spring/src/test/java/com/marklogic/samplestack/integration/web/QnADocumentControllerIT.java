package com.marklogic.samplestack.integration.web;


import java.io.UnsupportedEncodingException;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.testing.IntegrationTests;
import com.marklogic.samplestack.testing.QnADocumentControllerTestImpl;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@SpringApplicationConfiguration(classes = { Application.class })
@Category(IntegrationTests.class)
public class QnADocumentControllerIT extends QnADocumentControllerTestImpl {

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
	}

	@Override
	@Test
	public void voteUpQuestion() throws Exception {
		super.voteUpQuestion();
	}

	@Override
	@Test
	public void voteDownQuestion() throws Exception {
		super.voteDownQuestion();
	}

	@Override
	@Test
	public void voteUpAnswer() throws Exception {
		super.voteUpAnswer();
	}

	@Override
	@Test
	public void voteDownAnswer() throws Exception {
		super.voteDownAnswer();
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

	
}
