package com.marklogic.samplestack.db;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.DatabaseExtensionTest;
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
		
		
	}
}
