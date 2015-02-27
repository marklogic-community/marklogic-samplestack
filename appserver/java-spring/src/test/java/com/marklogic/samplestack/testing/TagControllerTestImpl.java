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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.node.ObjectNode;

/**
 * Shared implementation for TagsController unit and integration tests.
 */
public class TagControllerTestImpl extends ControllerTests {


	
	public void testTagsAnonymousOK() throws Exception {
		this.mockMvc.perform(
				post("/v1/tags").contentType(MediaType.APPLICATION_JSON)
						.content("{\"search\":{\"qtext\":\"true\"}}")
						.accept(MediaType.APPLICATION_JSON)).andExpect(
				status().isOk());
	}

	public void testTagsNoArgs() throws Exception {
		login("testC1@example.com", "c1");
		MvcResult result = this.mockMvc
				.perform(
						post("/v1/tags").session((MockHttpSession) session)
								.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk()).andReturn();
		JSONAssert.assertEquals("{values-response:{name:\"tags\"}}", result
				.getResponse().getContentAsString(), false);
	}

	/**
	 * This test includes the tag test-tag-data in order to
	 * isolate test data from seed data.
	 */
	public void testTagsWithArgument() throws Exception {
		login("testC1@example.com", "c1");
		MvcResult result = this.mockMvc
				.perform(
						post("/v1/tags").session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{\"search\":{\"forTag\":\"ada\",\"qtext\":[\"tag:test-data-tag\"]}}")
								.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk()).andReturn();
		String responseString = result
				.getResponse().getContentAsString();
		JSONAssert.assertEquals("{values-response:{name:\"tags\"}}", responseString, false);
		logger.debug(responseString);
		ObjectNode results = mapper.readValue(responseString, ObjectNode.class);
		assertEquals("Size of page length", 1, results.get("values-response").get("distinct-value").size());

	}
	
	public void testTagsWithPageLength() throws Exception {
		MvcResult result = this.mockMvc
				.perform(
						post("/v1/tags")
								.contentType(MediaType.APPLICATION_JSON)
								.content("{\"search\":{\"pageLength\":1}}")
								.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk()).andReturn();

		String responseString = result
				.getResponse().getContentAsString();
		JSONAssert.assertEquals("{values-response:{name:\"tags\"}}", responseString, false);

		ObjectNode results = mapper.readValue(responseString, ObjectNode.class);
		assertEquals("Size of page length", 1, results.get("values-response").get("distinct-value").size());

	}

	public void testStartLimitOrder() throws Exception {
		MvcResult result = this.mockMvc
				.perform(
						post("/v1/tags")
								.contentType(MediaType.APPLICATION_JSON)
								.content("{\"search\":{\"start\":3,"
										+ "\"sort\":\"name\"}}")
								.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk()).andReturn();
		String responseString = result
				.getResponse().getContentAsString();
		JSONAssert.assertEquals("{values-response:{name:\"tags\"}}", responseString, false);
	
	}

	public void testLoggedInSortFrequency() throws Exception {
		login("testC1@example.com", "c1");

		MvcResult result = this.mockMvc
				.perform(
						post("/v1/tags").session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content("{\"search\":{\"start\":1,"
										+ "\"sort\":\"frequency\","
										+ "\"pageLength\":5,"
										+ "\"qtext\":\"tag:test-data-tag\"}}")
								.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk()).andReturn();
		JSONAssert.assertEquals("{values-response:{distinct-value:[{_value: \"test-data-tag\",frequency: 11 },{_value: \"ada\",frequency: 2 }, { _value: \"javascript\", frequency: 2 }, { _value: \"python\", frequency: 2 }, { _value: \"tex\", frequency: 2 } ], name: \"tags\", type: \"xs:string\" } }"
					, result.getResponse().getContentAsString(), false);
	}

	
	public void testBadSort() throws Exception {
		@SuppressWarnings("unused")
		MvcResult result = this.mockMvc
				.perform(
						post("/v1/tags")
								.contentType(MediaType.APPLICATION_JSON)
								.content("{\"search\":{\"sort\":\"bug\"}}")
								.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isBadRequest()).andReturn();
	}

	public MvcResult testRelatedTagsNoArgs() throws Exception {
		MvcResult result = this.mockMvc
				.perform(
						post("/v1/tags")
								.contentType(MediaType.APPLICATION_JSON)
								.content("{\"search\":{\"relatedTo\":\"tex\","
										+ "\"start\":2,"
										+ "\"qtext\":\"tag:test-data-tag\"}}")
								.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk()).andReturn();
		return result;
	}

	public MvcResult testRelatedTagsStartPageLength() throws Exception {
		MvcResult result = this.mockMvc
				.perform(
						post("/v1/tags")
								.contentType(MediaType.APPLICATION_JSON)
								.content("{\"search\":{\"relatedTo\":\"tex\","
										+ "\"pageLength\":1,"
										+ "\"start\":3,"
										+ "\"qtext\":\"tag:test-data-tag\"}}")
								.accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk()).andReturn();
		return result;
	}

}
