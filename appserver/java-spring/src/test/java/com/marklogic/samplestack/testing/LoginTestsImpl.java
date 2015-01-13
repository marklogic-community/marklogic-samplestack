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
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Shared implementation for mocked and integration login tests.
 */
public class LoginTestsImpl extends ControllerTests {

	/**
	 * Bad credentials is a 401 Error body is in JSON
	 * 
	 * @throws Exception
	 */
	public void loginBadCredentials() throws Exception {

		// no username/password match
		mockMvc.perform(
				post("/v1/session")
				.with(csrf())
				.param("username", "nobody").param("password",
						"nopassword"))
				.andExpect(status().is(HttpStatus.UNAUTHORIZED.value()))
				.andReturn().getRequest().getSession();

		// bad credentials, existing user
		mockMvc.perform(
				post("/v1/session")
				.with(csrf())
				.param("username", "testC1@example.com")
						.param("password", "notJoesPassword"))
				.andExpect(status().is(HttpStatus.UNAUTHORIZED.value()))
				.andReturn().getRequest().getSession();

		String errorString = mockMvc
				.perform(
						post("/v1/session")
						.with(csrf())
						.param("username",
								"testC1@example.com").param("password",
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

		JsonNode loginNode = login("testC1@example.com", "c1");

		String userRole = loginNode.get("role").get(0).asText();
		assertEquals("test user's role is CONTRIBUTOR", "SAMPLESTACK_CONTRIBUTOR", userRole);

		String description = loginNode.get("displayName").asText();
		assertEquals("got joe's profile iformation from database", description, Utils.testC1.getDisplayName());

		MvcResult result = 
				mockMvc.perform(
						get("/v1/session").session((MockHttpSession) session))
						//.with(csrf().asHeader())
						.andExpect(status().isOk()).andReturn();

		String stringResult = result.getResponse().getContentAsString();
		JsonNode sessionNode = mapper.readValue(stringResult, JsonNode.class);;
		logger.debug("SESSINO NODE: " + stringResult);
		assertEquals(loginNode.get("id"), sessionNode.get("id"));
	
		assertNotNull(session);

		mockMvc.perform(
				get("/v1/questions").session((MockHttpSession) session).locale(
						Locale.ENGLISH)).andDo(print())
				.andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
		
		
		logout();
		mockMvc.perform(
				post("/v1/contributors").session((MockHttpSession) session).locale(
						Locale.ENGLISH)).andDo(print())
				.andExpect(status().isUnauthorized());
		
	}

	public void loginForbidden() throws Exception {
		login("testC1@example.com", "c1");

		assertNotNull(session);

		String errorString = mockMvc
				.perform(post("/v1/contributors/34")
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
						.with(csrf().asHeader())
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
