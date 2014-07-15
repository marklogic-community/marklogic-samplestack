package com.marklogic.samplestack.testing;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpSession;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;

public class LoginTestsImpl extends ControllerTests {

	/**
	 * Bad credentials is a 401 Error body is in JSON
	 * 
	 * @throws Exception
	 */
	public void loginBadCredentials() throws Exception {

		// no username/password match
		mockMvc.perform(
				post("/login")
				.with(csrf())
				.param("username", "nobody").param("password",
						"nopassword"))
				.andExpect(status().is(HttpStatus.UNAUTHORIZED.value()))
				.andReturn().getRequest().getSession();

		// bad credentials, existing user
		mockMvc.perform(
				post("/login")
				.with(csrf())
				.param("username", "joeUser@marklogic.com")
						.param("password", "notJoesPassword"))
				.andExpect(status().is(HttpStatus.UNAUTHORIZED.value()))
				.andReturn().getRequest().getSession();

		String errorString = mockMvc
				.perform(
						post("/login")
						.with(csrf())
						.param("username",
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

		JsonNode loginNode = login("joeUser@marklogic.com", "joesPassword");
		
		String userRole = loginNode.get("role").asText();
		assertEquals("joe's role is CONTRIBUTOR", "SAMPLESTACK_CONTRIBUTOR", userRole);

		assertNotNull(session);

		mockMvc.perform(
				get("/questions").session((MockHttpSession) session).locale(
						Locale.ENGLISH)).andDo(print())
				.andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
		
		
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
				.perform(post("/contributors/34")
						.with(csrf().asHeader())
						.session(
								(MockHttpSession) session).locale(
								Locale.ENGLISH)).andDo(print())
				.andExpect(status().isMethodNotAllowed())
				.andReturn().getResponse().getContentAsString();
		
		JsonNode errorNode = mapper.readValue(errorString, JsonNode.class);
		assertEquals("Error node has 405 in status", errorNode.get("status")
				.asText(), "405");

		errorString = mockMvc
				.perform(post("/notaurl/34")
						.with(csrf())
						.session(
								(MockHttpSession) session).locale(
								Locale.ENGLISH)).andDo(print())
				.andExpect(status().isForbidden())
				.andReturn().getResponse().getContentAsString();
		
		errorNode = mapper.readValue(errorString, JsonNode.class);
		assertEquals("Error node has 403 in status", errorNode.get("status")
				.asText(), "403");

		logout();

	}
}
