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
package com.marklogic.samplestack.integration.web;


import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.testing.HasVotedControllerTestImpl;
import com.marklogic.samplestack.testing.IntegrationTests;
import com.marklogic.samplestack.testing.TestDataManager;
import com.marklogic.samplestack.testing.Utils;

/**
 * Tests the service that returns candidate tags given a
 * substring to search for.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@SpringApplicationConfiguration(classes = { Application.class, TestDataManager.class })
@Category(IntegrationTests.class)
public class HasVotedControllerIT extends HasVotedControllerTestImpl {

	@Test
	public void testHasVoted() throws Exception {
		super.testHasVoted();
	}

	@Autowired
	private TestDataManager testData;
	
	@Test
	public void verifyIntegrationVoting() throws Exception {

		login("testC1@example.com", "c1");
		this.mockMvc.perform(get("/v1/hasVoted")
				.param("contributorId", Utils.testC1.getId())
				.param("questionId", testData.testA1QuestionIds.get(0))
				.session((MockHttpSession) session))
				.andExpect(status().isOk());
	}

}
