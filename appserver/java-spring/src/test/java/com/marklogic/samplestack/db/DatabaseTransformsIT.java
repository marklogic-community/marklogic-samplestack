package com.marklogic.samplestack.db;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.service.ContributorService;
import com.marklogic.samplestack.service.MarkLogicIntegrationTest;
import com.marklogic.samplestack.testing.DatabaseExtensionTest;
import com.marklogic.samplestack.testing.Utils;

/**
 * Tests the transforms installed in the
 * db-config/transforms directory upon which samplestack depends.
 * 
 */
@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = Application.class)
@Category(DatabaseExtensionTest.class)
public class DatabaseTransformsIT extends MarkLogicIntegrationTest {

	@Autowired 
	private ContributorService contributorService;
	
	private static String TEST_URI = "/dbtest/ask-1.json";
	
	@Before
	public void setup() {
		super.setup(TEST_URI);
	}
	
	@Test
    public void askTransform() {
		
		// make a user
		contributorService.store(Utils.joeUser);
		
		// make sure there's no question 
		operations.delete(ClientRole.SAMPLESTACK_CONTRIBUTOR, TEST_URI);
		// make a body
        ObjectNode input = mapper.createObjectNode();
        input.put("title", "Title");
        input.put("body", TEST_URI);
        
        ServerTransform askTransform = new ServerTransform("ask");
        askTransform.add("userName", Utils.joeUser.getUserName());
        
        contribManager.write(TEST_URI, new JacksonHandle(input), askTransform);
        
        JsonNode output = operations.getJsonDocument(ClientRole.SAMPLESTACK_CONTRIBUTOR, TEST_URI);
        
        assertTrue("ask transformed missing creationDate key", output.get("creationDate") != null);
        assertTrue("ask transformed missing comments array", output.get("comments").size() == 0);
        assertTrue("ask transformed missing answers array", output.get("answers").size() == 0);
        
        JsonNode ownerNode = output.get("owner");
        
        assertEquals("ask transformed missing owner property id", Utils.joeUser.getId().toString(), ownerNode.get("id").asText());
        assertEquals("ask transformed missing owner property userName", Utils.joeUser.getUserName(), ownerNode.get("userName").asText());
        assertEquals("ask transformed missing owner property displayName", Utils.joeUser.getDisplayName(), ownerNode.get("displayName").asText());
        contribManager.delete(TEST_URI);
    }

}