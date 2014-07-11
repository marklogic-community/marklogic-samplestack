package com.marklogic.samplestack.testing;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;

import com.marklogic.samplestack.domain.Contributor;

public class ContributorControllerTestImpl extends ControllerTests {

	private Logger logger = LoggerFactory
			.getLogger(ContributorControllerTestImpl.class);

	
	/**
	 * Tests the /login functionality
	 */
	public void testLogin() throws Exception {
			mockMvc
					.perform(
							post("/login").content(loginBody("nobody", "nopassword")))
					.andExpect(status().is(HttpStatus.UNAUTHORIZED.value()))
					.andReturn()
					.getRequest().getSession();
			
		mockMvc
				.perform(
						post("/login").content(loginBody("nobody", "nopassword")))
				.andExpect(status().is(HttpStatus.UNAUTHORIZED.value()))
				.andReturn()
				.getRequest().getSession();
		// (session);

		// another bad credential case
		mockMvc
				.perform(
						post("/login").content(loginBody("joeUser@marklogic.com","notJoesPassword")))
				.andExpect(status().is(HttpStatus.UNAUTHORIZED.value()))
				.andReturn()
				.getRequest().getSession();
		// assertNull(session);

		login("joeUser@marklogic.com", "joesPassword");

		assertNotNull(session);

		mockMvc.perform(
				get("/session").session((MockHttpSession) session).locale(
						Locale.ENGLISH)).andDo(print())
				.andExpect(status().isOk());

		logout();
		mockMvc.perform(
				get("/").session((MockHttpSession) session).locale(
						Locale.ENGLISH)).andDo(print())
		// TODO log bug for fixing login .andExpect(status().isForbidden());
				.andExpect(status().isUnauthorized());

	}

	/**
	 * tests /contributors POST /contributors GET /docs GET
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
		assertTrue(contributorsList.contains("displayName"));

		Contributor getById = mapper.readValue(
				this.mockMvc
						.perform(
								get("/contributors/" + returnedUser.getId())
										.session((MockHttpSession) session)
										.locale(Locale.ENGLISH))
						.andExpect(status().isOk()).andReturn().getResponse()
						.getContentAsString(), Contributor.class);

		assertEquals("Id name matches when get By ID", getById.getId(),
				returnedUser.getId());
	}

}
