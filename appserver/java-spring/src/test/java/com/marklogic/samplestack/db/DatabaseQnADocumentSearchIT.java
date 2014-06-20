package com.marklogic.samplestack.db;

import static org.junit.Assert.assertTrue;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.marklogic.client.io.SearchHandle;
import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.service.MarkLogicOperations;
import com.marklogic.samplestack.testing.DatabaseExtensionTest;


/**
 * Tests the functionality of the search services installed on the server.
 * Depends on database/options/questions.json
 * Depends on security setup
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = Application.class)
@Category(DatabaseExtensionTest.class)
public class DatabaseQnADocumentSearchIT {

	private static final String QUESTIONS_OPTIONS_NAME = "questions";
	private static final String QUESTIONS_DIR_NAME = "/questions/";
	
	@Autowired
	private MarkLogicOperations operations;
	
	@Before
	public void setupSearch() {
		// make sure there's data TODO
		// right now this test relies on having run gradle dbLoad
	}
	
	@Test
	/**
	 * On the home page, with no search string executed, 
	 * the default order is by lastActivityDate descending.
	 */
	public void defaultSearchOrdersByActivityDescending() {
		SearchHandle results = operations.searchDirectory(ClientRole.SAMPLESTACK_CONTRIBUTOR, QUESTIONS_DIR_NAME, "");
		assertTrue("Need data to test searches", results.getTotalResults() > 0);
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
