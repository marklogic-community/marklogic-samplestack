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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.mock.web.MockHttpSession;

/**
 * Shared implementation for TagsController unit and integration tests.
 */
public class TagControllerTestImpl extends ControllerTests {
	
	
	public void testTagsAnonymousOK() throws Exception {
		this.mockMvc.perform(
				get("/v1/tags"))
				.andExpect(status().isOk());
	}
	
	public void testTagsNoArgs() throws Exception {
		login("joeUser@marklogic.com", "joesPassword");
		this.mockMvc.perform(
				get("/v1/tags").session((MockHttpSession) session))
				.andExpect(status().isOk());
	}
	
	public void testTagsWithArgument() throws Exception {
		this.mockMvc.perform(
				get("/v1/tags?q=com"))
				.andExpect(status().isOk());
	}
}
