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
package com.marklogic.samplestack.integration.service;

import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.impl.DatabaseContext;
import com.marklogic.samplestack.service.MarkLogicOperations;
import com.marklogic.samplestack.service.TagsService;
import com.marklogic.samplestack.testing.IntegrationTests;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = { DatabaseContext.class })
@Category(IntegrationTests.class)
public class TagsServiceIT extends MarkLogicIntegrationIT {

	@Autowired
	TagsService tagsService;

	@Autowired
	MarkLogicOperations operations;

	@Test
	public void testTagSuggestion() {
		JsonNode tagsJson = getTestJson("questions/tags.json");

		JSONDocumentManager docMgr = operations
				.newJSONDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR);
		docMgr.write("/tags.json", new JacksonHandle(tagsJson));

		String[] suggestions = tagsService
				.suggestTags(ClientRole.SAMPLESTACK_CONTRIBUTOR);
		assertTrue("Need suggestions to test", suggestions.length > 0);

		suggestions = tagsService.suggestTags(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, "ab");
		assertTrue("Need suggestions to test", suggestions.length > 0);

		assertAllContain(suggestions, "ab");

		docMgr.delete("/tags.json");

	}

	@Test
	public void testAllTags() {
		JsonNode tagsJson = getTestJson("questions/tags.json");

		JSONDocumentManager docMgr = operations
				.newJSONDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR);
		docMgr.write("/tags.json", new JacksonHandle(tagsJson));

		String[] suggestions = tagsService
				.suggestTags(ClientRole.SAMPLESTACK_CONTRIBUTOR);
		assertTrue("Need suggestions to test", suggestions.length > 1);


		docMgr.delete("/tags.json");

	}

	private void assertAllContain(String[] suggestions, String pattern) {
		for (String suggestion : suggestions) {
			assertTrue("Suggestion contains candidate",
					suggestion.contains(pattern));
		}

	}

}
