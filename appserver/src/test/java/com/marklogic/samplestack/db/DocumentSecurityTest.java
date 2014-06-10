package com.marklogic.samplestack.db;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.extra.jackson.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.DatabaseExtensionTest;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.service.MarkLogicIntegrationTest;

/**
 * This test explicitly makes sure that the two database configurations have
 * appropriate privileges.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = Application.class)
@Category(DatabaseExtensionTest.class)
public class DocumentSecurityTest extends MarkLogicIntegrationTest {

	@Test
	public void testDocumentSecurity() {
		// write a document using writer connection.
		ObjectNode content = mapper.createObjectNode();
		content.put("body",  "content");
		operations.newJSONDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).write("/test/security.json", new JacksonHandle(content), new ServerTransform("json-in"));
		
		// verify no read with GUEST
		try {
			JacksonHandle invisibleDoc = operations.newJSONDocumentManager(ClientRole.SAMPLESTACK_GUEST).read("/test/security.json", new JacksonHandle());
			fail("Guest could see invisible documwent");
		} catch(ResourceNotFoundException e) {
			//pass
		}
		
		// verify read with CONTRIBUTOR
		JacksonHandle foundDoc = operations.newJSONDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).read("/test/security.json", new JacksonHandle());
		assertEquals("Contributor got back document", content, foundDoc.get());
			
		
		
	}
}
