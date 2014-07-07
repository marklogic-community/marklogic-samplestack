package com.marklogic.samplestack.service;

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

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = { DatabaseContext.class })
@Category(MiddleTierIntegrationTest.class)
public class TagsServiceTest extends MarkLogicIntegrationTest {

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
