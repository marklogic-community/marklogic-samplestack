package com.marklogic.samplestack.db;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.extra.jackson.JacksonHandle;
import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.service.MarkLogicIntegrationTest;
import com.marklogic.samplestack.testing.DatabaseExtensionTest;

/**
 * This test explicitly makes sure that the two database configurations have
 * appropriate privileges.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = Application.class)
@Category(DatabaseExtensionTest.class)
public class DocumentSecurityIT extends MarkLogicIntegrationTest {

	private static final String TEST_URI = "/test/security.json";
	
	@Before
	public void setup() {
		super.setup(TEST_URI);
	}
		

	@Test
	public void testDocumentSecurity() {
		// verify no read with GUEST
		try {
			@SuppressWarnings("unused")
			JacksonHandle invisibleDoc = operations.newJSONDocumentManager(
					ClientRole.SAMPLESTACK_GUEST).read(TEST_URI,
					new JacksonHandle());
			fail("Guest could see invisible documwent");
		} catch (ResourceNotFoundException e) {
			// pass
		}

		// verify read with CONTRIBUTOR
		JacksonHandle foundDoc = contribManager.read(TEST_URI,
				new JacksonHandle());
		assertEquals("Contributor got back document", content, foundDoc.get());
		contribManager.delete(TEST_URI);

	}
}
