package com.marklogic.samplestack.web;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import groovy.lang.Category;

import java.io.UnsupportedEncodingException;
import java.util.Locale;

import org.junit.Ignore;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.Utils;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.service.MiddleTierIntegrationTest;

@Category(MiddleTierIntegrationTest.class)
public class QnADocumentControllerTests extends ControllerTests {

	private Logger logger = LoggerFactory
			.getLogger(QnADocumentControllerTests.class);

	private QnADocument askedQuestion;
	private QnADocument answeredQuestion;

	@Test
	@Ignore
	// need to fix lastActivityDate value
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
		login("joeUser@marklogic.com", "joesPassword");

		// send a contributor to the questions endpoint
		this.mockMvc.perform(
				post("/questions").session((MockHttpSession) session)
						.locale(Locale.ENGLISH)
						.contentType(MediaType.APPLICATION_JSON)
						.content(mapper.writeValueAsString(Utils.joeUser)))
				.andExpect(status().isBadRequest());

		QnADocument qnaDoc = new QnADocument(mapper, "I'm a contributor",
				"I ask questions", "tag1", "tag2");
		// TODO MS 3 what's a malformed question?
	}

	@Test
	public void testAskQuestion() throws JsonProcessingException, Exception {
		contributorService.store(Utils.joeUser);

		login("joeUser@marklogic.com", "joesPassword");

		askQuestion();

		assertEquals("question returned contains original question",
				"Question from contributor",
				askedQuestion.getJson().get("title").asText());
	}

	private void askQuestion() throws Exception {
		if (askedQuestion == null) {
			login("joeUser@marklogic.com", "joesPassword");

			QnADocument qnaDoc = new QnADocument(mapper,
					"Question from contributor", "I ask questions", "tag1",
					"tag2");

			String payload = mapper.writeValueAsString(qnaDoc.getJson());

			// send a contributor to the questions endpoint
			String askedQuestion = this.mockMvc
					.perform(
							post("/questions")
									.session((MockHttpSession) session)
									.contentType(MediaType.APPLICATION_JSON)
									.content(payload))
					.andExpect(status().isCreated()).andReturn().getResponse()
					.getContentAsString();
			logger.debug(askedQuestion);

			ObjectNode node = mapper.readValue(askedQuestion, ObjectNode.class);
			this.askedQuestion = new QnADocument(node);
		}
	}

	@Test
	public void commentOnQuestion() throws Exception {
		contributorService.store(Utils.joeUser);

		login("joeUser@marklogic.com", "joesPassword");
		askQuestion();

		String commentedQuestion = this.mockMvc
				.perform(
						post(askedQuestion.getId().replace(".json", "") + "/comments")
								.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{\"text\":\"no comment.\"}"))
				.andExpect(status().isCreated()).andReturn().getResponse()
				.getContentAsString();

		
	}

	private void answerQuestion() throws Exception {
		login("joeUser@marklogic.com", "joesPassword");

		String docId = askedQuestion.getId().replace(".json", "");
		logger.debug(docId);
		// send a contributor to the questions endpoint
		String answeredQuestion = this.mockMvc
				.perform(
						post(docId + "/answers")
								.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content(
										"{\"text\":\"here's an answer for ya\"}"))
				.andExpect(status().isCreated()).andReturn().getResponse()
				.getContentAsString();
		logger.debug(answeredQuestion);
		ObjectNode node = mapper.readValue(answeredQuestion, ObjectNode.class);
		this.answeredQuestion = new QnADocument(node);
	}

	@Test
	public void testAnswerQuestion() throws Exception {
		contributorService.store(Utils.joeUser);
		contributorService.store(Utils.maryUser);

		askQuestion();

		answerQuestion();

		JsonNode answer = answeredQuestion.getJson().get("answers").get(0);
		assertEquals("answered question has an answer",
				Utils.joeUser.getUserName(), answer.get("owner")
						.get("userName").asText());

	}

	@Test
	public void commentOnAnswer() throws Exception {
		contributorService.store(Utils.joeUser);

		login("joeUser@marklogic.com", "joesPassword");
		askQuestion();
		answerQuestion();
		String answerId = answeredQuestion.getJson().get("answers").get(0).get("id").asText();
		String url = askedQuestion.getId().replace(".json", "") + answerId + "/comments";
		
		String commentedQuestion = this.mockMvc
				.perform(
						post(url)
							.session((MockHttpSession) session)
							.contentType(MediaType.APPLICATION_JSON)
							.content("{\"text\":\"no comment.\"}"))
				.andExpect(status().isCreated()).andReturn().getResponse()
				.getContentAsString();
		// TODO assertion
	}

	@Test
	@Ignore
	public void voteUpQuestion() {
		fail("Not Implemented");
	}

	@Test
	@Ignore
	public void voteDownQuestion() {
		fail("Not Implemented");
	}

	@Test
	@Ignore
	public void voteUpAnswer() {
		fail("Not Implemented");
	}

	@Test
	@Ignore
	public void voteDownAnswer() {
		fail("Not Implemented");
	}

	@Test
	@Ignore
	public void prohibitDuplicateVotes() {
		fail("Not Implemented");
	}

	@Test
	public void testAcceptAnswer() throws Exception {
		contributorService.store(Utils.joeUser);
		contributorService.store(Utils.maryUser);
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

	private void failAcceptQuestion( String docId,
			String answerId) throws UnsupportedEncodingException, Exception {
		this.mockMvc.perform(
				post(docId + answerId + "/accept")
						.session((MockHttpSession) session)
						.contentType(MediaType.APPLICATION_JSON).content("{}"))
				.andExpect(status().is4xxClientError());
	}

	private QnADocument succeedAcceptQuestion(String docId, String answerId) throws UnsupportedEncodingException,
			Exception {
		String acceptedQuestion = this.mockMvc
				.perform(
						post(docId + answerId + "/accept")
								.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{}")).andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString();
		logger.debug(acceptedQuestion);
		ObjectNode node = mapper.readValue(acceptedQuestion, ObjectNode.class);
		return new QnADocument(node);
	}

	@Test
	public void testAnonymousAccessToAccepted() throws Exception {
		qnaService.deleteAll();
		contributorService.store(Utils.joeUser);
		contributorService.store(Utils.maryUser);
		login("joeUser@marklogic.com", "joesPassword");
		askQuestion();
		answerQuestion();

		String docId = answeredQuestion.getJson().get("id").asText()
				.replaceAll(".json", "");
		JsonNode answer = answeredQuestion.getJson().get("answers").get(0);
		String answerId = answer.get("id").asText();

		JsonNode blankQuery = getTestJson("queries/blank.json");
		
		logout();
		
		String searchAnon = this.mockMvc
				.perform(
						post("/search")
								.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content(mapper.writeValueAsString(blankQuery))).andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString();
		JsonNode results = mapper.readValue(searchAnon, JsonNode.class);
		
		assertEquals("No results for anonymous. ", 0, results.get("results").size());
		
		login("joeUser@marklogic.com", "joesPassword");

		String acceptedQuestion = this.mockMvc
				.perform(
						post(docId + answerId + "/accept")
								.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{}")).andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString();
		
		logout();
		
		searchAnon = this.mockMvc
				.perform(
						post("/search")
								.session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content(mapper.writeValueAsString(blankQuery))).andExpect(status().isOk())
				.andReturn().getResponse().getContentAsString();
		results = mapper.readValue(searchAnon, JsonNode.class);
		
		assertEquals("No results for anonymous. ", 1, results.get("results").size());
		
		
	}
	
	
}
