package com.marklogic.samplestack.db;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.testing.DatabaseExtensionTest;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = Application.class)
@Category(DatabaseExtensionTest.class)
/**
 * Tests the functionality of the search services installed on the server.
 * Depends  database/options/qna
 * Depends on security setup
 */
public class DatabaseQnADocumentSearchIT {

	@Before
	public void setupSearch() {
		
	}
	
	@Test
	public void defaultSearchOrdersByActivityDescending() {
		
	}
	
	@Test
	public void guestSearchCannotSeeUnansweredQuestion() {
		
	}
	
	@Test
	public void authenticatedSearchSeesUnansweredQuestion() {
		
	}
	
	@Test
	public void testResponsePayloadFacets() {
	
	}
	
}
