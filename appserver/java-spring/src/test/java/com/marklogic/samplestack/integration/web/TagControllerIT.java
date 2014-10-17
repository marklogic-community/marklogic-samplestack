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

import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.impl.Clients;
import com.marklogic.samplestack.testing.IntegrationTests;
import com.marklogic.samplestack.testing.TagControllerTestImpl;

/**
 * Tests the service that returns candidate tags given a
 * substring to search for.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@SpringApplicationConfiguration(classes = { Application.class })
@Category(IntegrationTests.class)
public class TagControllerIT extends TagControllerTestImpl {

	@Autowired
	private Clients clients;
	
	@Before
	public void loadTags() {
		JsonNode tagsJson = getTestJson("questions/tags.json");

		JSONDocumentManager docMgr = clients.get(ClientRole.SAMPLESTACK_CONTRIBUTOR)
				.newJSONDocumentManager();
		docMgr.write("/tags.json", new JacksonHandle(tagsJson));
		docMgr.write("/tags2.json", new JacksonHandle(tagsJson));
		docMgr.write("/tags3.json", new JacksonHandle(tagsJson));
	}

	@Test
	@Ignore
	public void testTagsAnonymousOK() throws Exception {
		super.testTagsAnonymousOK();
	}

	@Test
	@Ignore
	public void testTagsNoArgs() throws Exception {
		super.testTagsNoArgs();
	}

	@Test
	@Ignore
	public void testTagsWithArgument() throws Exception {
		super.testTagsWithArgument();
	}
}
