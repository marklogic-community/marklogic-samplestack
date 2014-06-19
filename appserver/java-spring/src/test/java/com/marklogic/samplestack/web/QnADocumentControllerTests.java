package com.marklogic.samplestack.web;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.UnsupportedEncodingException;
import java.util.Locale;

import javax.servlet.http.HttpSession;

import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.testing.Utils;

public class QnADocumentControllerTests extends ControllerTests {

	private Logger logger = LoggerFactory
			.getLogger(QnADocumentControllerTests.class);

	@Test
	public void testAnonymousCanSearch() throws UnsupportedEncodingException,
			Exception {
		String questionResponse = this.mockMvc.perform(get("/questions"))
				.andExpect(status().isOk()).andReturn().getResponse()
				.getContentAsString();
		logger.debug(questionResponse);
		assertTrue("response from mock controller question is search response",
				questionResponse.contains("{\"results\""));
	}

	@Test
	public void testAnonymousCannotAsk() throws JsonProcessingException,
			Exception {

		QnADocument qnaDoc = new QnADocument(mapper, "I'm a guest",
				"I cannot ask questions");

		this.mockMvc.perform(
				post("/questions").contentType(MediaType.APPLICATION_JSON)
						.content(mapper.writeValueAsString(qnaDoc.getJson())))
		// TODO fix for forbidden
				.andExpect(status().is3xxRedirection());
	}

	@Test
	public void testAskMalformedQuestions() throws JsonProcessingException,
			Exception {
		HttpSession session = login("joeUser@marklogic.com", "joesPassword");

		// send a contributor to the questions endpoint
		this.mockMvc.perform(
				post("/questions").session((MockHttpSession) session)
						.locale(Locale.ENGLISH)
						.contentType(MediaType.APPLICATION_JSON)
						.content(mapper.writeValueAsString(Utils.joeUser)))
				.andExpect(status().isBadRequest());

		QnADocument qnaDoc = new QnADocument(mapper, "I'm a contributor",
				"I ask questions", "tag1", "tag2");

	}

	@Test
	public void testAskQuestion() throws JsonProcessingException, Exception {
		contribService.store(Utils.joeUser);

		HttpSession session = login("joeUser@marklogic.com", "joesPassword");

		QnADocument askedQuestion = askQuestion();

		assertEquals("question returned contains original question",
				"Question from contributor",
				askedQuestion.getJson().get("title").asText());
	}

	private QnADocument askQuestion() throws Exception {
		HttpSession session = login("joeUser@marklogic.com", "joesPassword");

		QnADocument qnaDoc = new QnADocument(mapper,
				"Question from contributor", "I ask questions", "tag1", "tag2");

		String payload = mapper.writeValueAsString(qnaDoc.getJson());

		// send a contributor to the questions endpoint
		String askedQuestion = this.mockMvc
				.perform(
						post("/questions").session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content(payload))
				.andExpect(status().isCreated()).andReturn().getResponse()
				.getContentAsString();
		logger.debug(askedQuestion);

		ObjectNode node = mapper.readValue(askedQuestion, ObjectNode.class);
		return new QnADocument(node);
	}

	@Test
	public void commentOnQuestion() {

	}

	@Test
	public void answerQuestion() throws Exception {
		HttpSession session = login("joeUser@marklogic.com", "joesPassword");

		QnADocument askedQuestion = askQuestion();
		String docId = askedQuestion.getId();
		logger.debug(docId);
		// send a contributor to the questions endpoint
		String answeredQuestion = this.mockMvc
				.perform(
						post(docId + "/answers").session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{}"))
				.andExpect(status().isOk()).andReturn().getResponse()
				.getContentAsString();
		logger.debug(answeredQuestion);
	}

	@Test
	public void commentOnAnswer() {

	}

	@Test
	public void voteUpQuestion() {
	}

	@Test
	public void voteDownQuestion() {
	}

	@Test
	public void voteUpAnswer() {
	}

	@Test
	public void voteDownAnswer() {
	}

	@Test
	public void prohibitDuplicateVotes() {
	}

	@Test
	public void acceptAnswer() {
	}

	@Test
	public void testAnonymousAccessToAccepted() {
	}

	@Test
	public void acceptAnotherAnswer() { // adjust reputation

	}

}
