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

import static org.junit.Assert.fail;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MvcResult;

import com.marklogic.samplestack.exception.SamplestackUnsupportedException;

/**
 * Shared implementation for TagsController unit and integration tests.
 */
public class TagControllerTestImpl extends ControllerTests {

	public void testTagsAnonymousOK() throws Exception {
		this.mockMvc.perform(
				post("/v1/tags").contentType(MediaType.APPLICATION_JSON)
						.content("{\"qtext\":\"true\"}")
						.accept(MediaType.APPLICATION_JSON)).andExpect(
				status().isOk());
	}

	public void testTagsNoArgs() throws Exception {
		login("joeUser@marklogic.com", "joesPassword");
		MvcResult result = this.mockMvc
				.perform(post("/v1/tags")
				.session((MockHttpSession) session)
				.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk()).andReturn();
		JSONAssert.assertEquals("{values-response:\"chuck\"}", result
				.getResponse().getContentAsString(), false);
	}

	public void testTagsWithArgument() throws Exception {
		MvcResult result = this.mockMvc
				.perform(
						post("/v1/tags")
								.contentType(MediaType.APPLICATION_JSON)
								.content("{\"qtext\":\"be\"}}")
								.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk()).andReturn();
		logger.debug(result.getResponse().getContentAsString());
		JSONAssert.assertEquals("{values-response:\"chuck\"}", result
				.getResponse().getContentAsString(), false);

	}

	public void testStartLimitOrder() throws Exception {
		MvcResult result = this.mockMvc
				.perform(
						post("/v1/tags")
								.contentType(MediaType.APPLICATION_JSON)
								.content("{\"qtext\":\"be\"}}")
								.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk()).andReturn();
		JSONAssert.assertEquals("{values-response:\"chuck\"}", result
				.getResponse().getContentAsString(), false);
	}

	public void testBadSort() throws Exception {
		try {
			MvcResult result = this.mockMvc
					.perform(

							post("/v1/tags")
									.contentType(MediaType.APPLICATION_JSON)
									.content("{\"sort\":\"ddd\"}")
									.accept(MediaType.APPLICATION_JSON))
					.andExpect(status().isOk()).andReturn();
			fail("Should have thrown sort exception");
			JSONAssert.assertEquals("{values-response:\"chuck\"}", result
					.getResponse().getContentAsString(), false);
		} catch (SamplestackUnsupportedException e) {
			// pass
		}
	}

}
