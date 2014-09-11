/*
 * Copyright 2012-2014 MarkLogic Corporation
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
import static org.junit.Assert.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;

import com.marklogic.samplestack.domain.Contributor;

/**
 * Implementation of contributor controller tests, for both mocked and integration tests.
 */
public class ContributorControllerTestImpl extends ControllerTests {

	private Logger logger = LoggerFactory
			.getLogger(ContributorControllerTestImpl.class);

	/**
	 * tests /contributors POST /contributors GET /docs GET
	 */
	public void testContributorCRUD() throws Exception {
		login("joeUser@marklogic.com", "joesPassword");
		Contributor basicUser = Utils.getBasicUser();
		this.mockMvc.perform(
				post("/contributors")
				.with(csrf())
				.session((MockHttpSession) session)
						.locale(Locale.ENGLISH)
						.contentType(MediaType.APPLICATION_JSON)
						.content(mapper.writeValueAsString(basicUser)))
				.andExpect(status().isForbidden());

		logger.debug("Basic User:" + mapper.writeValueAsString(basicUser));
		login("maryAdmin@marklogic.com", "marysPassword");
		
		MockHttpServletResponse response = this.mockMvc
				.perform(
						post("/contributors")
								.with(csrf())
								.session((MockHttpSession) session)
								.locale(Locale.ENGLISH)
								.contentType(MediaType.APPLICATION_JSON)
								.content(mapper.writeValueAsString(basicUser)))
				//.andExpect(status().isCreated())
				.andReturn().getResponse();
		String returnedString = response
				.getContentAsString();
		Contributor returnedUser = mapper.readValue(returnedString,
				Contributor.class);
		logger.debug("Returned User:" + mapper.writeValueAsString(returnedUser));
		assertEquals("cgreer@marklogic.com", returnedUser.getUserName());

		String contributorsList = this.mockMvc
				.perform(
						get("/contributors").session(
								(MockHttpSession) session)).andReturn()
				.getResponse().getContentAsString();

		logger.info("contributors list" + contributorsList);
		assertTrue(contributorsList.contains("totalPages"));

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
		
		logout();
		getById = mapper.readValue(
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
