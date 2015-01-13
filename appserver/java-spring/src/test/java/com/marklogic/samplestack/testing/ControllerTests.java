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

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.IOException;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.web.FilterChainProxy;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.exception.SamplestackIOException;
import com.marklogic.samplestack.service.QnAService;

/**
 * Superclass for the tests that deal with controllers.  Provides IoC wiring
 * and shared resources.
 */
public class ControllerTests {

	protected Logger logger = LoggerFactory.getLogger(ControllerTests.class);

	@Autowired
	private WebApplicationContext wac;

	@Autowired
	private FilterChainProxy springSecurityFilter;

	@Autowired
	protected ObjectMapper mapper;

	protected MockMvc mockMvc;

	protected HttpSession session;

	protected QnADocument askedQuestion;

	@Autowired
	protected QnAService qnaService;

	@PostConstruct
	public void setup() {
		if (this.mockMvc == null) {
			this.mockMvc = MockMvcBuilders.webAppContextSetup(this.wac)
					.addFilter(this.springSecurityFilter, "/*").build();
		}
	}

	protected String loginBody(String username, String password) {
		return "{\"username\":\"" + username + "\",\"password\":\"" + password
				+ "\"}";
	}

	protected JsonNode getTestJson(String testPath) {
		ClassPathResource r = new ClassPathResource(testPath);
		try {
			return mapper.readValue(r.getInputStream(), JsonNode.class);
		} catch (IOException e) {
			throw new SamplestackIOException(e);
		}
	}

	protected JsonNode login(String username, String password) throws Exception {

		MvcResult result = mockMvc
				.perform(
						post("/v1/session")
						//.with(csrf().asHeader())
						.param("username", username)
						.param("password", password))
				// TODO 'restful' login content(loginBody(username, password)))
				.andExpect(status().isOk()).andReturn();

		this.session = result.getRequest().getSession();
		String stringResult = result.getResponse().getContentAsString();
		return mapper.readValue(stringResult, JsonNode.class);
	}

	protected void logout() throws Exception {
		this.session = this.mockMvc.perform(delete("/v1/session"))
				.andExpect(status().isOk())
				.andReturn()
				.getRequest().getSession();
	}

	protected void askQuestion() throws Exception {
		if (askedQuestion == null) {
			login("testC1@example.com", "c1");

			QnADocument qnaDoc = new QnADocument(mapper,
					"Mary's Question Number 0", "I ask questions", "tag1",
					"tag2", "test-data-tag");

			String payload = mapper.writeValueAsString(qnaDoc.getJson());

			// send a contributor to the questions endpoint
			String askedQuestion = this.mockMvc
					.perform(
							post("/v1/questions").with(csrf())
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

}
