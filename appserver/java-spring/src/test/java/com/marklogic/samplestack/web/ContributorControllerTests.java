package com.marklogic.samplestack.web;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import groovy.lang.Category;

import java.util.Locale;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.samplestack.Utils;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.mock.MockApplication;
import com.marklogic.samplestack.service.MiddleTierIntegrationTest;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = { MockApplication.class })
@Category(MiddleTierIntegrationTest.class)
public class ContributorControllerTests extends ControllerTests {
	
	private Logger logger = LoggerFactory.getLogger(ContributorControllerTests.class);

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
