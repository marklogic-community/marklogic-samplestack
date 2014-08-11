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
package com.marklogic.samplestack.testing;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import java.io.UnsupportedEncodingException;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.domain.QnADocument;

/**
 * Share implementation for QnADocumentController unit and integration tests.
 */
public class QnADocumentControllerTestImpl extends ControllerTests {

	Logger logger = LoggerFactory.getLogger(QnADocumentControllerTestImpl.class);

	private QnADocument answeredQuestion;

	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#testAnonymousCanSearch()
	 */
	
	public void testAnonymousCanSearch() throws UnsupportedEncodingException,
			Exception {
		String questionResponse = this.mockMvc
				.perform(get("/questions").accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk()).andReturn().getResponse()
				.getContentAsString();
		logger.debug(questionResponse);
		assertTrue("response from mock controller question is search response",
				questionResponse.contains("\"snippet-format\":\"raw\""));
		
		
		questionResponse = this.mockMvc
				.perform(post("/search").with(csrf())
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"search\":{\"qtext\":\"true\"}}")
				.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk()).andReturn().getResponse()
				.getContentAsString();
		logger.debug(questionResponse);
		assertTrue("response from mock controller question is search response",
				questionResponse.contains("\"snippet-format\":\"raw\""));
			
	}
	

	public void testLoggedInCanSearch() throws UnsupportedEncodingException, Exception {
		login("joeUser@marklogic.com", "joesPassword");

		String questionResponse = this.mockMvc
				.perform(get("/questions")
				.session((MockHttpSession) session)
				.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk()).andReturn().getResponse()
				.getContentAsString();
		logger.debug(questionResponse);
		assertTrue("response from mock controller question is search response",
				questionResponse.contains("\"snippet-format\":\"raw\""));
		
		
		questionResponse = this.mockMvc
				.perform(post("/search")
				.with(csrf())
				.session((MockHttpSession) session)
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"search\":{\"qtext\":\"true\"}}")
				.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk()).andReturn().getResponse()
				.getContentAsString();
		logger.debug(questionResponse);
		assertTrue("response from mock controller question is search response",
				questionResponse.contains("\"snippet-format\":\"raw\""));
			
	}


	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#testAnonymousCannotAsk()
	 */
	
	public void testAnonymousCannotAsk() throws JsonProcessingException,
			Exception {

		QnADocument qnaDoc = new QnADocument(mapper, "I'm a guest",
				"I cannot ask questions");

		this.mockMvc.perform(
				post("/questions").with(csrf()).contentType(MediaType.APPLICATION_JSON)
						.content(mapper.writeValueAsString(qnaDoc.getJson())))
		// TODO fix for forbidden
				.andExpect(status().isUnauthorized());
	}

	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#testAskMalformedQuestions()
	 */
	
	public void testAskMalformedQuestions() throws JsonProcessingException,
			Exception {
		login("joeUser@marklogic.com", "joesPassword");

		// send a contributor to the questions endpoint
		this.mockMvc.perform(
				post("/questions").with(csrf()).session((MockHttpSession) session)
						.locale(Locale.ENGLISH)
						.contentType(MediaType.APPLICATION_JSON)
						.content(mapper.writeValueAsString(Utils.joeUser)))
				.andExpect(status().isBadRequest());

		@SuppressWarnings("unused")
		QnADocument qnaDoc = new QnADocument(mapper, "I'm a contributor",
				"I ask questions", "tag1", "tag2");
		// TODO MS 3 what's a malformed question?
	}

	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#testAskQuestion()
	 */
	
	public void testAskQuestion() throws JsonProcessingException, Exception {
		login("joeUser@marklogic.com", "joesPassword");

		askQuestion();

		assertEquals("question returned contains original question",
				"Question from contributor",
				askedQuestion.getJson().get("title").asText());
		
		String getQuestion = this.mockMvc
		.perform(
				get(askedQuestion.getId())
						.with(csrf())
						.session((MockHttpSession) session))
						.andExpect(status().isOk()).andReturn().getResponse()
						.getContentAsString();	
		
	}

	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#commentOnQuestion()
	 */
	
	
	public void commentOnQuestion() throws Exception {

		login("joeUser@marklogic.com", "joesPassword");
		askQuestion();

		this.mockMvc
				.perform(
						post(askedQuestion.getId() + "/comments")
								.with(csrf())
								.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{\"text\":\"no comment.\"}"))
				.andExpect(status().isCreated()).andReturn().getResponse()
				.getContentAsString();

	}

	private void answerQuestion() throws Exception {
		if (answeredQuestion == null) {
			login("joeUser@marklogic.com", "joesPassword");

			String docId = askedQuestion.getId().replace(".json", "");
			logger.debug(docId);
			// send a contributor to the questions endpoint
			String answeredQuestion = this.mockMvc
					.perform(
							post(docId + "/answers").with(csrf())
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
				Utils.joeUser.getUserName(), answer.get("owner")
						.get("userName").asText());

	}

	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#commentOnAnswer()
	 */
	
	
	public void commentOnAnswer() throws Exception {
		login("joeUser@marklogic.com", "joesPassword");
		askQuestion();
		answerQuestion();
		String answerId = answeredQuestion.getJson().get("answers").get(0)
				.get("id").asText();
		String url = askedQuestion.getId().replace(".json", "") + answerId
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
	
	
	public void voteUpQuestion() throws Exception {
		login("joeUser@marklogic.com", "joesPassword");
		askQuestion();
		this.mockMvc
				.perform(
						post(this.askedQuestion.getId() + "/upvotes")
								.with(csrf())
								.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{}")).andExpect(status().isCreated())
				.andReturn().getResponse().getContentAsString();
		// TODO assertion.
	}

	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#voteDownQuestion()
	 */
	
	
	public void voteDownQuestion() throws Exception {
		login("joeUser@marklogic.com", "joesPassword");
		askQuestion();
		this.mockMvc
				.perform(
						post(this.askedQuestion.getId() + "/downvotes")
								.with(csrf())
								.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{}")).andExpect(status().isCreated())
				.andReturn().getResponse().getContentAsString();
	}

	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#voteUpAnswer()
	 */
	
	
	public void voteUpAnswer() throws Exception {
		login("joeUser@marklogic.com", "joesPassword");
		askQuestion();
		answerQuestion();
		JsonNode answer = answeredQuestion.getJson().get("answers").get(0);
		String answerId = answer.get("id").asText();

		this.mockMvc
				.perform(
						post(this.askedQuestion.getId() + answerId + "/upvotes")
								.with(csrf())
								.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{}")).andExpect(status().isCreated())
				.andReturn().getResponse().getContentAsString();
	}

	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#voteDownAnswer()
	 */
	
	
	public void voteDownAnswer() throws Exception {
		login("joeUser@marklogic.com", "joesPassword");
		askQuestion();
		answerQuestion();
		JsonNode answer = answeredQuestion.getJson().get("answers").get(0);
		String answerId = answer.get("id").asText();

		this.mockMvc
				.perform(
						post(
								this.askedQuestion.getId() + answerId
										+ "/downvotes")
								.with(csrf())
								.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{}")).andExpect(status().isCreated())
				.andReturn().getResponse().getContentAsString();
	}

	/* (non-Javadoc)
	 * @see com.marklogic.samplestack.unit.web.QnAControllerTests#testAcceptAnswer()
	 */
	
	
	public void testAcceptAnswer() throws Exception {
		login("joeUser@marklogic.com", "joesPassword");
		askQuestion();
		answerQuestion();

		String docId = answeredQuestion.getJson().get("id").asText()
				.replaceAll(".json", "");
		JsonNode answer = answeredQuestion.getJson().get("answers").get(0);
		String firstAnswerId = answer.get("id").asText();

		login("maryAdmin@marklogic.com", "marysPassword");
		failAcceptQuestion(docId, firstAnswerId);

		login("joeUser@marklogic.com", "joesPassword");
		QnADocument acceptedQuestion = succeedAcceptQuestion(docId,
				firstAnswerId);

		assertEquals("Answer accepted", firstAnswerId, acceptedQuestion
				.getJson().get("acceptedAnswerId").asText());

	}

	private void failAcceptQuestion(String docId, String answerId)
			throws UnsupportedEncodingException, Exception {
		this.mockMvc.perform(
				post(docId + answerId + "/accept")
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
						post(docId + answerId + "/accept")
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
		qnaService.deleteAll();
		login("joeUser@marklogic.com", "joesPassword");
		askQuestion();
		answerQuestion();

		String docId = answeredQuestion.getJson().get("id").asText()
				.replaceAll(".json", "");
		JsonNode answer = answeredQuestion.getJson().get("answers").get(0);
		String answerId = answer.get("id").asText();

		logout();

		JsonNode blankQuery = getTestJson("queries/blank.json");

		logout();

		String searchAnon = this.mockMvc
				.perform(
						post("/search").with(csrf()).session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content(mapper.writeValueAsString(blankQuery)))
				.andExpect(status().isOk()).andReturn().getResponse()
				.getContentAsString();
		JsonNode results = mapper.readValue(searchAnon, JsonNode.class);

		assertEquals("No results for anonymous. ", 0, results.get("results")
				.size());

		login("joeUser@marklogic.com", "joesPassword");

		this.mockMvc
				.perform(
						post(docId + answerId + "/accept")
								.with(csrf())
								.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{}")).andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString();

		logout();

		searchAnon = this.mockMvc
				.perform(
						post("/search").with(csrf()).session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content(mapper.writeValueAsString(blankQuery)))
				.andExpect(status().isOk()).andReturn().getResponse()
				.getContentAsString();
		results = mapper.readValue(searchAnon, JsonNode.class);

		assertEquals("No results for anonymous. ", 1, results.get("results")
				.size());

	}

}
