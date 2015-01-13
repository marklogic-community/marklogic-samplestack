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
package com.marklogic.samplestack.testing;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.UnsupportedEncodingException;
import java.util.Locale;

import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.domain.QnADocument;

/**
 * Share implementation for QnADocumentController unit and integration tests.
 */
public class QnADocumentControllerTestImpl extends ControllerTests {

	private QnADocument answeredQuestion;

	public void testAnonymousCanSearch() throws UnsupportedEncodingException,
			Exception {
		String questionResponse = this.mockMvc
				.perform(get("/v1/questions").accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk()).andReturn().getResponse()
				.getContentAsString();
		logger.debug(questionResponse);
		JSONAssert.assertEquals("{snippet-format:\"snippet\"}", questionResponse, false);
		
		
		questionResponse = this.mockMvc
				.perform(post("/v1/search").with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"search\":{\"qtext\":\"true\"}}")
				.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk()).andReturn().getResponse()
				.getContentAsString();
		logger.debug(questionResponse);
		JSONAssert.assertEquals("{snippet-format:\"snippet\"}", questionResponse, false);

	}
	

	public void testLoggedInCanSearch() throws UnsupportedEncodingException, Exception {
		login("testC1@example.com", "c1");

		String questionResponse = this.mockMvc
				.perform(get("/v1/questions")
				.session((MockHttpSession) session)
				.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk()).andReturn().getResponse()
				.getContentAsString();
		logger.debug(questionResponse);
		JSONAssert.assertEquals("{snippet-format:\"snippet\"}", questionResponse, false);

		questionResponse = this.mockMvc
				.perform(post("/v1/search")
				.with(csrf())
				.session((MockHttpSession) session)
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"search\":{\"qtext\":\"true\"}}")
				.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk()).andReturn().getResponse()
				.getContentAsString();
		logger.debug(questionResponse);
		JSONAssert.assertEquals("{snippet-format:\"snippet\"}", questionResponse, false);
	}


	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#testAnonymousCannotAsk()
	 */
	
	public void testAnonymousCannotAsk() throws JsonProcessingException,
			Exception {

		QnADocument qnaDoc = new QnADocument(mapper, "I'm a guest",
				"I cannot ask questions");

		this.mockMvc.perform(
				post("/v1/questions").with(csrf()).contentType(MediaType.APPLICATION_JSON)
						.content(mapper.writeValueAsString(qnaDoc.getJson())))
				.andExpect(status().isUnauthorized());
	}

	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#testAskMalformedQuestions()
	 */
	
	public void testAskMalformedQuestions() throws JsonProcessingException,
			Exception {
		login("testC1@example.com", "c1");

		// send a contributor to the questions endpoint
		this.mockMvc.perform(
				post("/v1/questions").with(csrf()).session((MockHttpSession) session)
						.locale(Locale.ENGLISH)
						.contentType(MediaType.APPLICATION_JSON)
						.content(mapper.writeValueAsString(Utils.testC1)))
				.andExpect(status().isBadRequest());

		@SuppressWarnings("unused")
		QnADocument qnaDoc = new QnADocument(mapper, "I'm a contributor",
				"I ask questions", "tag1", "tag2");
	}

	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#testAskQuestion()
	 */
	
	public void testAskQuestion() throws JsonProcessingException, Exception {
		login("testC1@example.com", "c1");

		askQuestion();

		assertEquals("question returned contains original question",
				"Mary's Question Number 0",
				askedQuestion.getJson().get("title").asText());

		MvcResult result = this.mockMvc
		.perform(
				get("/v1/questions/" + askedQuestion.getId())
						.with(csrf())
						.session((MockHttpSession) session))
						.andExpect(status().isOk()).andReturn();	

		JsonNode questionNode = mapper.readValue(result.getResponse().getContentAsString(), JsonNode.class);
		logger.debug(mapper.writeValueAsString(questionNode));
		assertNotNull("Missing Reputation on single question response", questionNode.get("owner").get("reputation"));
	}

	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#commentOnQuestion()
	 */
	
	
	public void commentOnQuestion() throws Exception {

		login("testC1@example.com", "c1");
		askQuestion();

		this.mockMvc
				.perform(
						post("/v1/questions/" + askedQuestion.getId() + "/comments")
								.with(csrf())
								.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{\"text\":\"no comment.\"}"))
				.andExpect(status().isCreated()).andReturn().getResponse()
				.getContentAsString();

	}

	private void answerQuestion() throws Exception {
		if (answeredQuestion == null) {
			login("testC1@example.com", "c1");

			String docId = askedQuestion.getId().replace(".json", "");
			logger.debug(docId);
			// send a contributor to the questions endpoint
			String answeredQuestion = this.mockMvc
					.perform(
							post("/v1/questions/" + docId + "/answers").with(csrf())
									.session((MockHttpSession) session)
									.contentType(MediaType.APPLICATION_JSON)
									.content(
											"{\"text\":\"here's an answer for ya\"}"))
					.andExpect(status().isCreated()).andReturn().getResponse()
					.getContentAsString();
			logger.debug(answeredQuestion);
			ObjectNode node = mapper.readValue(answeredQuestion,
					ObjectNode.class);
			this.answeredQuestion = new QnADocument(node);
		}
	}

	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#testAnswerQuestion()
	 */
	
	
	public void testAnswerQuestion() throws Exception {
		askQuestion();

		answerQuestion();

		JsonNode answer = answeredQuestion.getJson().get("answers").get(0);
		assertEquals("answered question has an answer",
				Utils.testC1.getUserName(), answer.get("owner")
						.get("userName").asText());
	}

	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#commentOnAnswer()
	 */
	
	
	public void commentOnAnswer() throws Exception {
		login("testC1@example.com", "c1");
		askQuestion();
		answerQuestion();
		String answerId = answeredQuestion.getJson().get("answers").get(0)
				.get("id").asText();
		String url = "/v1/questions/" + askedQuestion.getId().replace(".json", "") + "/answers/" + answerId
				+ "/comments";

		this.mockMvc
				.perform(
						post(url)
						.with(csrf())
						.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{\"text\":\"no comment.\"}"))
				.andExpect(status().isCreated()).andReturn().getResponse()
				.getContentAsString();
	}

	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#voteUpQuestion()
	 */
	
	
	public JsonNode voteUpQuestion() throws Exception {
		login("testC1@example.com", "c1");
		askQuestion();
		MockHttpServletResponse result = this.mockMvc
				.perform(
						post("/v1/questions/" + this.askedQuestion.getId() + "/upvotes")
								.with(csrf())
								.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{}")).andExpect(status().isCreated())
				.andReturn().getResponse();
		return mapper.readValue(result.getContentAsString(), JsonNode.class);
	}

	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#voteDownQuestion()
	 */
	
	
	public JsonNode voteDownQuestion() throws Exception {
		login("testC1@example.com", "c1");
		askQuestion();
		MockHttpServletResponse result = this.mockMvc
				.perform(
						post("/v1/questions/" + this.askedQuestion.getId() + "/downvotes")
								.with(csrf())
								.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{}")).andExpect(status().isCreated())
				.andReturn().getResponse();
		return mapper.readValue(result.getContentAsString(), JsonNode.class);
	}

	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#voteUpAnswer()
	 */
	public JsonNode voteUpAnswer() throws Exception {
		askQuestion();
		answerQuestion();
		JsonNode answer = answeredQuestion.getJson().get("answers").get(0);
		String answerId = answer.get("id").asText();
		MockHttpServletResponse result = this.mockMvc
				.perform(
						post("/v1/questions/" + this.askedQuestion.getId() + "/answers/" + answerId + "/upvotes")
								.with(csrf())
								.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{}")).andExpect(status().isCreated())
				.andReturn().getResponse();
		logout();
		login("testA1@example.com", "a1");

		result = this.mockMvc
				.perform(
						post("/v1/questions/" + this.askedQuestion.getId() + "/answers/" + answerId + "/upvotes")
								.with(csrf())
								.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{}")).andExpect(status().isCreated())
				.andReturn().getResponse();
		return mapper.readValue(result.getContentAsString(), JsonNode.class);
	}

	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#voteDownAnswer()
	 */
	
	
	public JsonNode voteDownAnswer() throws Exception {
		login("testC1@example.com", "c1");
		askQuestion();
		answerQuestion();
		JsonNode answer = answeredQuestion.getJson().get("answers").get(0);
		String answerId = answer.get("id").asText();

		MockHttpServletResponse result = this.mockMvc
				.perform(
						post("/v1/questions/" +
								this.askedQuestion.getId() + 
								"/answers/" +
								answerId + 
								"/downvotes")
								.with(csrf())
								.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{}")).andExpect(status().isCreated())
				.andReturn().getResponse();
		return mapper.readValue(result.getContentAsString(), JsonNode.class);
	}

	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#testAcceptAnswer()
	 */
	
	
	public void testAcceptAnswer() throws Exception {
		login("testC1@example.com", "c1");
		askQuestion();
		answerQuestion();

		String docId = answeredQuestion.getJson().get("id").asText()
				.replaceAll(".json", "");
		JsonNode answer = answeredQuestion.getJson().get("answers").get(0);
		String firstAnswerId = answer.get("id").asText();

		login("testA1@example.com", "a1");
		failAcceptQuestion(docId, firstAnswerId);

		login("testC1@example.com", "c1");
		QnADocument acceptedQuestion = succeedAcceptQuestion(docId,
				firstAnswerId);

		assertEquals("Answer accepted", firstAnswerId, acceptedQuestion
				.getJson().get("acceptedAnswerId").asText());

	}

	private void failAcceptQuestion(String docId, String answerId)
			throws UnsupportedEncodingException, Exception {
		this.mockMvc.perform(
				post("/v1/questions/" + docId + "/answers/" + answerId + "/accept")
						.with(csrf())
						.session((MockHttpSession) session)
						.contentType(MediaType.APPLICATION_JSON).content("{}"))
				.andExpect(status().is4xxClientError());
	}

	private QnADocument succeedAcceptQuestion(String docId, String answerId)
			throws UnsupportedEncodingException, Exception {
		logger.debug("Accepting answer: " + docId + answerId + "/accept");
		String acceptedQuestion = this.mockMvc
				.perform(
						post("/v1/questions/" + docId + "/answers/" + answerId + "/accept")
								.with(csrf())
								.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{}")).andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString();
		logger.debug(acceptedQuestion);
		ObjectNode node = mapper.readValue(acceptedQuestion, ObjectNode.class);
		return new QnADocument(node);
	}

	
	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#testAnonymousAccessToAccepted()
	 */
	
	public void testAnonymousAccessToAccepted() throws Exception {
		login("testC1@example.com", "c1");
		askQuestion();
		answerQuestion();

		String docId = answeredQuestion.getJson().get("id").asText()
				.replaceAll(".json", "");
		JsonNode answer = answeredQuestion.getJson().get("answers").get(0);
		String answerId = answer.get("id").asText();

		logout();

		JsonNode testTagDataQuery = getTestJson("queries/test-tag-data-query.json");

		logout();

		String searchAnon = this.mockMvc
				.perform(
						post("/v1/search").with(csrf()).session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content(mapper.writeValueAsString(testTagDataQuery)))
				.andExpect(status().isOk()).andReturn().getResponse()
				.getContentAsString();
		JsonNode results = mapper.readValue(searchAnon, JsonNode.class);

		assertEquals("Only stock acceped question for anonymous. ", 2, results.get("results")
				.size());

		login("testC1@example.com", "c1");

		this.mockMvc
				.perform(
						post("/v1/questions/" + docId + "/answers/" + answerId + "/accept")
								.with(csrf())
								.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{}")).andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString();

		logout();

		searchAnon = this.mockMvc
				.perform(
						post("/v1/search").with(csrf()).session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content(mapper.writeValueAsString(testTagDataQuery)))
				.andExpect(status().isOk()).andReturn().getResponse()
				.getContentAsString();
		results = mapper.readValue(searchAnon, JsonNode.class);

		assertEquals("One more result for anonymous. ", 3, results.get("results")
				.size());
	}


	public void badUrlCommentThrows404() throws Exception {
		login("testC1@example.com", "c1");
		this.mockMvc
				.perform(
						post("/v1/questions/soqnotaquestion22138139/answers/soa22141114/comments")
								.with(csrf())
								.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{\"text\":\"no comment.\"}"))
				.andExpect(status().isNotFound());
	}


	/**
	 * Support for timezone is an extra key from the browser layer.
	 * @throws Exception 
	 * @throws JsonProcessingException
	 */
	public MockHttpServletResponse testIncludeTimezone(String queryResource) throws JsonProcessingException, Exception {

		JsonNode testTimezoneQuery = getTestJson(queryResource);

		login("testC1@example.com", "c1");

		MockHttpServletResponse result = this.mockMvc
				.perform(
						post("/v1/search").with(csrf()).session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content(mapper.writeValueAsString(testTimezoneQuery)))
				.andExpect(status().isOk()).andReturn().getResponse();

		return result;
	}


	public void testBadTimezone() throws JsonProcessingException, Exception {
		JsonNode testTimezoneQuery = getTestJson("queries/test-bad-timezone-query.json");
		
		this.mockMvc
				.perform(
						post("/v1/search").with(csrf()).session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content(mapper.writeValueAsString(testTimezoneQuery)))
				.andExpect(status().isBadRequest());
	
	}

}
