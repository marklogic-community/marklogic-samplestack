package com.marklogic.samplestack.web;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.impl.DatabaseContext;
import com.marklogic.samplestack.service.ContributorService;
import com.marklogic.samplestack.service.MarkLogicIntegrationTest;
import com.marklogic.samplestack.testing.UnitTest;
import com.marklogic.samplestack.testing.Utils;

@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = { Application.class })
@Category(UnitTest.class)
public class ControllerTests extends MarkLogicIntegrationTest {

	private Logger logger = LoggerFactory.getLogger(ControllerTests.class);

	@Autowired
	private WebApplicationContext wac;

	@Autowired
	private FilterChainProxy springSecurityFilter;

	protected MockMvc mockMvc;

	protected HttpSession session;

	@Before
	public void setup() {
		this.mockMvc = MockMvcBuilders.webAppContextSetup(this.wac)
				.addFilter(this.springSecurityFilter, "/*").build();
	}

	protected void login(String username, String password) throws Exception {
		this.session = mockMvc
				.perform(
						post("/login").param("username", username).param(
								"password", password))
				.andExpect(status().is(HttpStatus.FOUND.value()))
				.andExpect(redirectedUrl("/")).andReturn().getRequest()
				.getSession();

	}

	protected void logout() throws Exception {
		this.session = this.mockMvc.perform(get("/logout")).andReturn().getRequest()
				.getSession();
	}

	@Test
	public void testLogin() throws Exception {
		mockMvc
				.perform(
						post("/login").param("username", "nobody").param(
								"password", "nopassword"))
				.andExpect(status().is(HttpStatus.FOUND.value()))
				.andExpect(redirectedUrl("/login?error")).andReturn()
				.getRequest().getSession();
		// (session);

		// another bad credential case
		mockMvc
				.perform(
						post("/login").param("username",
								"joeUser@marklogic.com").param("password",
								"notJoesPassword"))
				.andExpect(status().is(HttpStatus.FOUND.value()))
				.andExpect(redirectedUrl("/login?error")).andReturn()
				.getRequest().getSession();
		// assertNull(session);

		login("joeUser@marklogic.com", "joesPassword");

		assertNotNull(session);

		mockMvc.perform(
				get("/").session((MockHttpSession) session).locale(
						Locale.ENGLISH)).andDo(print())
				.andExpect(status().isOk());

		logout();
		mockMvc.perform(
				get("/").session((MockHttpSession) session).locale(
						Locale.ENGLISH)).andDo(print())
		// TODO log bug for fixing login .andExpect(status().isForbidden());
				.andExpect(status().is3xxRedirection());

	}

	@Test
	/**
	 * tests /contributors POST
	 * /contributors GET
	 * /docs GET
	 */
	public void testContributorCRUD() throws Exception {
		login("joeUser@marklogic.com", "joesPassword");
		Contributor joeUser = Utils.getBasicUser();
		this.mockMvc.perform(
				post("/contributors").session((MockHttpSession) session)
						.locale(Locale.ENGLISH)
						.contentType(MediaType.APPLICATION_JSON)
						.content(mapper.writeValueAsString(joeUser)))
				.andExpect(status().isForbidden());

		login("maryAdmin@marklogic.com", "marysPassword");
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

}
