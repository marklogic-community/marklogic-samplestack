package com.marklogic.samplestack.web;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.UnsupportedEncodingException;
import java.util.Locale;

import javax.servlet.http.HttpSession;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.web.FilterChainProxy;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.testing.UnitTest;
import com.marklogic.samplestack.testing.Utils;

@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = { Application.class })
@Category(UnitTest.class)
public class ControllerTests {

	private Logger logger = LoggerFactory.getLogger(ControllerTests.class);

	@Autowired
	private WebApplicationContext wac;

	@Autowired
	private FilterChainProxy springSecurityFilter;

	@Autowired
	private ObjectMapper mapper;

	private MockMvc mockMvc;

	@Before
	public void setup() {
		this.mockMvc = MockMvcBuilders.webAppContextSetup(this.wac)
				.addFilter(this.springSecurityFilter, "/*").build();
	}
	

	private HttpSession login(String username, String password)
			throws Exception {
		HttpSession session = mockMvc
				.perform(
						post("/login").param("username", username).param(
								"password", password))
				.andExpect(status().is(HttpStatus.FOUND.value()))
				.andExpect(redirectedUrl("/")).andReturn().getRequest()
				.getSession();
		return session;
	}

	private HttpSession logout() throws Exception {
		return this.mockMvc.perform(get("/logout")).andReturn().getRequest()
				.getSession();
	}

	@Test
	public void testLogin() throws Exception {
		HttpSession session = mockMvc
				.perform(
						post("/login").param("username", "nobody").param(
								"password", "nopassword"))
				.andExpect(status().is(HttpStatus.FOUND.value()))
				.andExpect(redirectedUrl("/login?error")).andReturn()
				.getRequest().getSession();
		// (session);

		// another bad credential case
		session = mockMvc
				.perform(
						post("/login").param("username",
								"joeUser@marklogic.com").param("password",
								"notJoesPassword"))
				.andExpect(status().is(HttpStatus.FOUND.value()))
				.andExpect(redirectedUrl("/login?error")).andReturn()
				.getRequest().getSession();
		// assertNull(session);

		session = login("joeUser@marklogic.com", "joesPassword");

		assertNotNull(session);

		mockMvc.perform(
				get("/").session((MockHttpSession) session).locale(
						Locale.ENGLISH)).andDo(print())
				.andExpect(status().isOk());

		session = logout();
		mockMvc.perform(
				get("/").session((MockHttpSession) session).locale(
						Locale.ENGLISH)).andDo(print())
				.andExpect(status().isForbidden());

	}

	@Test
	/**
	 * tests /contributors POST
	 * /contributors GET
	 * /docs GET
	 */
	public void testContributorCRUD() throws Exception {
		HttpSession session = login("joeUser@marklogic.com", "joesPassword");
		Contributor joeUser = Utils.getBasicUser();
		this.mockMvc.perform(
				post("/contributors").session((MockHttpSession) session)
						.locale(Locale.ENGLISH)
						.contentType(MediaType.APPLICATION_JSON)
						.content(mapper.writeValueAsString(joeUser)))
				.andExpect(status().isForbidden());

		session = login("maryAdmin@marklogic.com", "marysPassword");
		String returnedString = this.mockMvc
				.perform(
						post("/contributors")
								.session((MockHttpSession) session)
								.locale(Locale.ENGLISH)
								.contentType(MediaType.APPLICATION_JSON)
								.content(mapper.writeValueAsString(joeUser)))
				.andExpect(status().isCreated()).andReturn().getResponse()
				.getContentAsString();
		Contributor returnedUser = mapper.readValue(returnedString,
				Contributor.class);
		assertEquals("cgreer@marklogic.com", returnedUser.getUserName());

		String contributorsList = this.mockMvc
				.perform(
						get("/contributors?q=grechaw").session(
								(MockHttpSession) session)).andReturn()
				.getResponse().getContentAsString();

		logger.info("contributors list" + contributorsList);
		assertTrue(contributorsList.contains("Some text about a basic user"));

		Contributor getById = mapper.readValue(
				this.mockMvc
						.perform(
								get("/contributors/" + returnedUser.getId())
										.session((MockHttpSession) session)
										.locale(Locale.ENGLISH))
						.andExpect(status().isOk()).andReturn().getResponse()
						.getContentAsString(), Contributor.class);

		Contributor getByDocURI = mapper.readValue(
				this.mockMvc
						.perform(
								get("/docs")
										.param("docUri",
												"/contributors/"
														+ returnedUser.getId()
														+ ".json")
										.session((MockHttpSession) session)
										.locale(Locale.ENGLISH))
						.andExpect(status().isOk()).andReturn().getResponse()
						.getContentAsString(), Contributor.class);

		Utils.compareContributors(
				"Document and ID crud should get same payload.", getById,
				getByDocURI);

	}

	@Test
	public void testAnonymousCanSearch() throws UnsupportedEncodingException,
			Exception {
		String questionResponse = this.mockMvc.perform(get("/questions"))
				.andExpect(status().isOk()).andReturn().getResponse()
				.getContentAsString();
		logger.debug(questionResponse);
		assertTrue("response from mock controller question is search response", questionResponse.contains("{\"results\""));
	}

	@Test
	public void testAnonymousCannotAsk() throws JsonProcessingException, Exception {
		
		QnADocument qnaDoc = new QnADocument(mapper, "I'm a guest", "I cannot ask questions");
		
		this.mockMvc.perform(
				post("/questions").contentType(MediaType.APPLICATION_JSON)
						.content(mapper.writeValueAsString(qnaDoc.getJson())))
				.andExpect(status().isForbidden());
	}

	@Test
	public void testAskMalformedQuestions() throws JsonProcessingException, Exception {	
		HttpSession session = login("joeUser@marklogic.com", "joesPassword");
		
		// send a contributor to the questions endpoint
		this.mockMvc.perform(
				post("/questions")
				.session((MockHttpSession) session)
				.locale(Locale.ENGLISH).contentType(MediaType.APPLICATION_JSON)
						.content(mapper.writeValueAsString(Utils.joeUser)))
				.andExpect(status().isBadRequest());
		
		
		QnADocument qnaDoc = new QnADocument(mapper, "I'm a contributor", "I ask questions", "tag1", "tag2");
		
	}

	@Test
	public void testAskQuestion() throws JsonProcessingException, Exception {	
		HttpSession session = login("joeUser@marklogic.com", "joesPassword");
		
		QnADocument qnaDoc = new QnADocument(mapper, "Question from contributor", "I ask questions", "tag1", "tag2");

		String payload = mapper.writeValueAsString(qnaDoc.getJson());
		
		// send a contributor to the questions endpoint
		String askedQuestion =
				this.mockMvc.perform(
				post("/questions").session((MockHttpSession) session)
						.contentType(MediaType.APPLICATION_JSON)
						.content(payload))
				.andExpect(status().isCreated())
				.andReturn().getResponse().getContentAsString();
		logger.debug(askedQuestion);
		
		assertTrue("question returned contains original question", askedQuestion.contains("I ask questions"));
	}

	@Test
	public void commentOnQuestion() {
		
	}
	
	@Test
	public void answerQuestion() {
		
	}
	
	@Test
	public void commentOnAnswer() {
	
	}
	
	@Test public void voteUpQuestion() {	}
	
	@Test public void voteDownQuestion() { }
	@Test public void voteUpAnswer() { }
	@Test public void voteDownAnswer() { }
	@Test public void prohibitDuplicateVotes() { }
	@Test public void acceptAnswer() { }
	@Test public void testAnonymousAccessToAccepted() { }
	@Test public void acceptAnotherAnswer() {  // adjust reputation 
		
	}
	
	
}
