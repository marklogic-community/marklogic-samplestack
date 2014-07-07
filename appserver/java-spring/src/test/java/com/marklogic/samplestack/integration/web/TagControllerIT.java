package com.marklogic.samplestack.integration.web;

import org.junit.Before;
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
import com.marklogic.samplestack.service.MarkLogicOperations;
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
	MarkLogicOperations operations;
	
	@Before
	public void loadTags() {
		JsonNode tagsJson = getTestJson("questions/tags.json");

		JSONDocumentManager docMgr = operations
				.newJSONDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR);
		docMgr.write("/tags.json", new JacksonHandle(tagsJson));

	}
	
	@Test
	public void testTagsAnonymousOK() throws Exception {
		super.testTagsAnonymousOK();
	}
	
	@Test
	public void testTagsNoArgs() throws Exception {
		super.testTagsNoArgs();
	}
	
	@Test
	public void testTagsWithArgument() throws Exception {
		super.testTagsWithArgument();
	}
}
