package com.marklogic.samplestack.testing;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpSession;

import com.fasterxml.jackson.databind.JsonNode;

public class LoginTestsImpl extends ControllerTests {

	/**
	 * Bad credentials is a 401 Error body is in JSON
	 * 
	 * @throws Exception
	 */
	public void loginBadCredentials() throws Exception {

		// no username/password match
		mockMvc.perform(
				post("/login").param("username", "nobody").param("password",
						"nopassword"))
				.andExpect(status().is(HttpStatus.UNAUTHORIZED.value()))
				.andReturn().getRequest().getSession();

		// bad credentials, existing user
		mockMvc.perform(
				post("/login").param("username", "joeUser@marklogic.com")
						.param("password", "notJoesPassword"))
				.andExpect(status().is(HttpStatus.UNAUTHORIZED.value()))
				.andReturn().getRequest().getSession();

		String errorString = mockMvc
				.perform(
						post("/login").param("username",
								"joeUser@marklogic.com").param("password",
								"notJoesPassword"))
				.andExpect(status().is(HttpStatus.UNAUTHORIZED.value()))
				.andReturn().getResponse().getContentAsString();

		// ensure parsing
		logger.debug("Response from mock bad auth: " + errorString);
		
		JsonNode errorNode = mapper.readValue(errorString, JsonNode.class);
		assertEquals("Error node has 401 in status", errorNode.get("status")
				.asText(), "401");

	}

	public void loginNormalFlow() throws Exception {

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
				.andExpect(status().isUnauthorized());

	}

	public void loginForbidden() throws Exception {
		login("joeUser@marklogic.com", "joesPassword");

		assertNotNull(session);

		String errorString = mockMvc
				.perform(
						get("/").session(
								(MockHttpSession) session).locale(
								Locale.ENGLISH)).andDo(print())
				.andExpect(status().isForbidden())
				.andReturn().getResponse().getContentAsString();
		
		// ensure parsing
		JsonNode errorNode = mapper.readValue(errorString, JsonNode.class);
		assertEquals("Error node has 403 in status", errorNode.get("status")
				.asText(), "403");

		logout();

	}
}
