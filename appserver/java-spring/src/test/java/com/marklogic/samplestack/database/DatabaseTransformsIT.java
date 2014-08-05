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
package com.marklogic.samplestack.database;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.impl.DatabaseContext;
import com.marklogic.samplestack.integration.service.MarkLogicIntegrationIT;
import com.marklogic.samplestack.service.ContributorService;
import com.marklogic.samplestack.testing.DatabaseExtensionTests;
import com.marklogic.samplestack.testing.Utils;

/**
 * Tests the transforms installed in the db-config/transforms directory upon
 * which samplestack depends.
 * 
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = DatabaseContext.class)
@Category(DatabaseExtensionTests.class)
public class DatabaseTransformsIT extends MarkLogicIntegrationIT {

	@Autowired
	private ContributorService contributorService;

	private static String TEST_URI = "/questions/transform-doc.json";
	private static String DUMMY_URI = "/nodoc.json";

	@Before
	public void setup() {
		super.setup(TEST_URI);
	}

	private void askQuestion() {

		// make a user
		contributorService.store(Utils.joeUser);

		// make sure there's no question
		operations.delete(ClientRole.SAMPLESTACK_CONTRIBUTOR, TEST_URI);
		// make a body
		ObjectNode input = mapper.createObjectNode();
		input.put("title", "Title");
		input.put("text", "question");
		input.put("id", TEST_URI);

		ServerTransform askTransform = new ServerTransform("ask");
		askTransform.add("userName", Utils.joeUser.getUserName());

		contribManager.write(TEST_URI, new JacksonHandle(input), askTransform);

	}

	@Test
	public void askTransform() {

		askQuestion();

		JsonNode output = operations.getJsonDocument(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, TEST_URI);

		assertTrue("ask transformed missing creationDate key",
				output.get("creationDate") != null);
		assertTrue("ask transformed missing comments array",
				output.get("comments").size() == 0);
		assertTrue("ask transformed missing answers array",
				output.get("answers").size() == 0);

		JsonNode ownerNode = output.get("owner");

		assertEquals("ask transformed missing owner property id", Utils.joeUser
				.getId().toString(), ownerNode.get("id").asText());
		assertEquals("ask transformed missing owner property userName",
				Utils.joeUser.getUserName(), ownerNode.get("userName").asText());
		assertEquals("ask transformed missing owner property displayName",
				Utils.joeUser.getDisplayName(), ownerNode.get("displayName")
						.asText());
		contribManager.delete(TEST_URI);
	}

	private void askAndAnswer() {

		askQuestion();

		// add the answer -- use a service though as this refactor is done
		
		qnaService.answer( Utils.joeUser.getUserName(), TEST_URI.replace(".json", ""), "this is the text of my answer");


	}

	@Test
	public void answerPatchTransform() {
		// make a user
		contributorService.store(Utils.joeUser);

		// make sure there's no question
		operations.delete(ClientRole.SAMPLESTACK_CONTRIBUTOR, TEST_URI);

		askAndAnswer();

		JsonNode output = operations.getJsonDocument(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, TEST_URI);

		ArrayNode answers = (ArrayNode) output.get("answers");

		assertEquals("transform added an answer",
				"this is the text of my answer", answers.get(0).get("text")
						.asText());
		assertEquals("transform added a user", Utils.joeUser.getUserName(),
				answers.get(0).get("owner").get("userName").asText());
		assertTrue("transform added empty comments",
				answers.get(0).get("comments") != null);

		contribManager.delete(TEST_URI);
	}

	@Test
	public void acceptPatchTransform() {
		// make a user
		contributorService.store(Utils.joeUser);

		// make sure there's no question
		operations.delete(ClientRole.SAMPLESTACK_CONTRIBUTOR, TEST_URI);

		askAndAnswer();

		// now we can accept an answer.
		JsonNode qnaDoc = operations.getJsonDocument(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, TEST_URI);

		ArrayNode answers = (ArrayNode) qnaDoc.get("answers");
		String answerId = answers.get(0).get("id").asText();

		ServerTransform acceptTransform = new ServerTransform("accept-patch");
		acceptTransform.add("answerId", answerId);

		// dummy uri because this transform does an update on parent doc.
		contribManager.write(DUMMY_URI, new StringHandle(""), acceptTransform);

		// check accept
		qnaDoc = operations.getJsonDocument(ClientRole.SAMPLESTACK_CONTRIBUTOR,
				TEST_URI);

		assertEquals("doc has acceptedAnswerId", answerId,
				qnaDoc.get("acceptedAnswerId").asText());
		assertTrue("answerid is accepted",
				qnaDoc.get("answers").get(0).get("accepted").asBoolean());

	}

	@Test
	public void commentPatchTransform() {
		// make a user
		contributorService.store(Utils.joeUser);

		// make sure there's no question
		operations.delete(ClientRole.SAMPLESTACK_CONTRIBUTOR, TEST_URI);

		askAndAnswer();

		// now we can comment on an answer.
		JsonNode qnaDoc = operations.getJsonDocument(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, TEST_URI);

		ArrayNode answers = (ArrayNode) qnaDoc.get("answers");
		String answerId = answers.get(0).get("id").asText();

		ServerTransform commentTransform = new ServerTransform("comment-patch");
		commentTransform.put("postId", answerId);
		commentTransform.put("text", "text of comment on answer");
		commentTransform.put("userName", Utils.joeUser.getUserName());

		// dummy uri because this transform does an update on parent doc.
		contribManager.write(DUMMY_URI, new StringHandle(""), commentTransform);

		commentTransform = new ServerTransform("comment-patch");
		commentTransform.put("postId", TEST_URI);
		commentTransform.put("text", "text of comment on question");
		commentTransform.put("userName", Utils.joeUser.getUserName());

		// dummy uri because this transform does an update on parent doc.
		contribManager.write(DUMMY_URI, new StringHandle(""), commentTransform);

		// check comments
		qnaDoc = operations.getJsonDocument(ClientRole.SAMPLESTACK_CONTRIBUTOR,
				TEST_URI);

		assertEquals("doc has comment", 1, qnaDoc.get("comments").size());
		assertEquals("answer has comment", 1,
				qnaDoc.get("answers").get(0).get("comments").size());
		assertEquals("doc has right", "text of comment on question", qnaDoc
				.get("comments").get(0).get("text").asText());
		assertEquals("answer has right", "text of comment on answer", qnaDoc
				.get("answers").get(0).get("comments").get(0).get("text")
				.asText());

	}

	@Test
	public void votePatchTransform() {
		// make a user
		contributorService.store(Utils.joeUser);

		// make sure there's no question
		operations.delete(ClientRole.SAMPLESTACK_CONTRIBUTOR, TEST_URI);

		askAndAnswer();

		// now we can comment on an answer.
		JsonNode qnaDoc = operations.getJsonDocument(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, TEST_URI);

		ArrayNode answers = (ArrayNode) qnaDoc.get("answers");
		String answerId = answers.get(0).get("id").asText();
		String postId = qnaDoc.get("id").asText();

		ServerTransform voteTransform = new ServerTransform("vote-patch");
		voteTransform.put("postId", postId);
		voteTransform.put("delta", "1");
		voteTransform.put("userName", Utils.joeUser.getUserName());

		// dummy uri because this transform does an update on parent doc.
		contribManager.write(DUMMY_URI, new StringHandle(""), voteTransform);

		qnaDoc = operations.getJsonDocument(ClientRole.SAMPLESTACK_CONTRIBUTOR,
				TEST_URI);
		
		assertEquals("question has updated itemTally", "1", qnaDoc
				.get("itemTally").asText());
		assertEquals("question has updated score", "1", qnaDoc.get("docScore").asText());

		voteTransform = new ServerTransform("vote-patch");
		voteTransform.put("postId", answerId);
		voteTransform.put("delta", "-1");
		voteTransform.put("userName", Utils.joeUser.getUserName());

		// dummy uri because this transform does an update on parent doc.
		// this should FAIL, joe cant vote twice.
		contribManager.write(DUMMY_URI, new StringHandle(""), voteTransform);
		// check comments
		qnaDoc = operations.getJsonDocument(ClientRole.SAMPLESTACK_CONTRIBUTOR,
				TEST_URI);
		assertEquals("question has untouched itemTally", "1", qnaDoc
				.get("itemTally").asText());
		assertEquals("question has updated score", "0", qnaDoc.get("docScore").asText());
		assertEquals("answer has updated itemTally", "-1", qnaDoc.get("answers").get(0)
				.get("itemTally").asText());
		
		
	}
}