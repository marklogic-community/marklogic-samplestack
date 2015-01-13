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
package com.marklogic.samplestack.database;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.samplestack.dbclient.DatabaseContext;
import com.marklogic.samplestack.integration.service.MarkLogicIntegrationIT;
import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.testing.DatabaseExtensionTests;

/**
 * This test explicitly makes sure that the two database configurations have
 * appropriate privileges.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = DatabaseContext.class)
@Category(DatabaseExtensionTests.class)
public class DocumentSecurityIT extends MarkLogicIntegrationIT {

	private static final String TEST_URI = "/test/security.json";
	
		

	@Test
	public void testDocumentSecurity() {
		//setup
		content = mapper.createObjectNode();
		content.put("body", "content");
		contribManager = clients.get(ClientRole.SAMPLESTACK_CONTRIBUTOR).newJSONDocumentManager();
		contribManager.write(TEST_URI, new JacksonHandle(content));
		// verify no read with GUEST

		try {
			@SuppressWarnings("unused")
			JacksonHandle invisibleDoc = clients.get(ClientRole.SAMPLESTACK_GUEST)
				.newJSONDocumentManager()
				.read(TEST_URI, new JacksonHandle());
			fail("Guest could see invisible documwent");
		} catch (ResourceNotFoundException e) {
			// pass
		}

		// verify read with CONTRIBUTOR
		JacksonHandle foundDoc = contribManager.read(TEST_URI,
				new JacksonHandle());
		assertEquals("Contributor got back document", content, foundDoc.get());

		// cleanup
		contribManager.delete(TEST_URI);
	}
}
