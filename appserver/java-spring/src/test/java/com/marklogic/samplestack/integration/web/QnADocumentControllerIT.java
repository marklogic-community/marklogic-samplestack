/*
 * Copyright 2012-2014 MarkLogic Corporation
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


import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.util.List;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.SamplestackConstants.ISO8601Formatter;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.testing.IntegrationTests;
import com.marklogic.samplestack.testing.QnADocumentControllerTestImpl;
import com.marklogic.samplestack.testing.TestDataManager;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@SpringApplicationConfiguration(classes = { Application.class, TestDataManager.class })
@Category(IntegrationTests.class)
public class QnADocumentControllerIT extends QnADocumentControllerTestImpl {

	Logger logger = LoggerFactory.getLogger(QnADocumentControllerIT.class);

	private Date deleteSince = null;
	
	@Before
	public void storeTimestamp() {
		deleteSince = new Date();
	}

	@After
	public void cleanupEachTest() throws JsonParseException, JsonMappingException, IOException {
		ObjectNode structuredQuery = mapper.readValue(new ClassPathResource("queries/clean-range.json").getInputStream(), ObjectNode.class);
		ObjectNode rangeQueryNode = (ObjectNode) structuredQuery.get("query").get("range-query");
		rangeQueryNode.put("value", ISO8601Formatter.format(deleteSince));

		ObjectNode joesQuestions = qnaService.rawSearch(ClientRole.SAMPLESTACK_CONTRIBUTOR, structuredQuery, 1);
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
