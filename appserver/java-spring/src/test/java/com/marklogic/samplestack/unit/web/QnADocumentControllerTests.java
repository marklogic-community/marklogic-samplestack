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
package com.marklogic.samplestack.unit.web;

import groovy.lang.Category;

import java.io.UnsupportedEncodingException;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.marklogic.samplestack.mock.MockApplication;
import com.marklogic.samplestack.testing.IntegrationTests;
import com.marklogic.samplestack.testing.QnADocumentControllerTestImpl;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@SpringApplicationConfiguration(classes = { MockApplication.class })
@Category(IntegrationTests.class)
/**
 * Unit tests for QnADocumentController.
 */
public class QnADocumentControllerTests extends QnADocumentControllerTestImpl {

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

	@Test
	public void testVoteUpQuestion() throws Exception {
		super.voteUpQuestion();
	}

	@Test
	public void testVoteDownQuestion() throws Exception {
		super.voteDownQuestion();
	}

	@Test
	public void testVoteUpAnswer() throws Exception {
		super.voteUpAnswer();
	}

	@Test
	public void testVoteDownAnswer() throws Exception {
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
		//not a mockable test
	}
	
	@Test
	public void testIncludeTimezoneAdjustsDateFacet() throws JsonProcessingException, Exception {
		super.testIncludeTimezone("queries/test-timezone-query.json");
	}

}
