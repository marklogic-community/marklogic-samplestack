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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.mock.web.MockHttpSession;

public class HasVotedControllerTestImpl extends ControllerTests {

	
	public void testHasVoted() throws Exception {
		
		this.mockMvc.perform(get("/v1/hasVoted"))
				.andExpect(status().isBadRequest());
		
		this.mockMvc.perform(get("/v1/hasVoted")
				.param("contributorId", "1"))
				.andExpect(status().isBadRequest());
		
		this.mockMvc.perform(get("/v1/hasVoted")
				.param("contributorId", "1")
				.param("questionId", "1"))
				.andExpect(status().isOk());
		
		login("testC1@example.com", "c1");
		this.mockMvc.perform(get("/v1/hasVoted")
				.param("contributorId", "1")
				.param("questionId", "1")
				.session((MockHttpSession) session))
				.andExpect(status().isOk());
	}

}
