package com.marklogic.samplestack.db;

import static org.junit.Assert.assertTrue;

import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.document.DocumentPage;
import com.marklogic.client.io.SearchHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.FacetValue;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.impl.DatabaseContext;
import com.marklogic.samplestack.service.MarkLogicOperations;
import com.marklogic.samplestack.testing.DatabaseExtensionTest;


/**
 * Tests the functionality of the search services installed on the server.
 * Depends on database/options/questions.json
 * Depends on security setup
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = DatabaseContext.class)
@Category(DatabaseExtensionTest.class)
public class DatabaseQnADocumentSearchIT {


	private final Logger logger = LoggerFactory
			.getLogger(DatabaseQnADocumentSearchIT.class);

	private static final String QUESTIONS_OPTIONS_NAME = "questions";
	private static final String QUESTIONS_DIR_NAME = "/questions/";
	
	@Autowired
	private ObjectMapper mapper;
	
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
	 * 
	 * This search includes
	 * results:
	 * score
	 * nanswers
	 * answered or not
	 * title
	 * tags
	 * creationDate
	 * owner/username
	 * 
	 * facets:
	 * tags, frequency ordered, limit n
	 * date, buckets, probably combined query to support.
	 * 
	 * inputs
	 * main search string
	 * checkboxes (show mine only)
	 * 
	 * options:
	 * sort by newest (lastActivityDate descending)
	 * sort by relevance (score)
	 */
	public void defaultSearchOrdersByActivityDescending() {
		DocumentPage results = operations.searchDirectory(ClientRole.SAMPLESTACK_CONTRIBUTOR, QUESTIONS_DIR_NAME, "");
		assertTrue("Need data to test searches", results.getTotalSize() > 0);
		
	}
	
	@Test
	@Ignore
	public void guestSearchSeesOnlyResolvedQuestions() {
		
	}
	
	@Test
	@Ignore
	public void authenticatedSearchSeesUnresolvedQuestions() {
		
	}
	
	@Test
	public void testResponsePayloadFacets() {
	
	}
	
	@Test
	public void testTagSearch() {
		String query = "tag:monotouch";
		SearchHandle handle = new SearchHandle();
		DocumentPage page = operations.searchDirectory(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, "/questions/", query, 1, handle);
		logger.debug(handle.getQuery(new StringHandle()).get());
		FacetValue v = handle.getFacetResult("tag").getFacetValues()[1];
		logger.debug("Count of monotouch facet + " + v.getCount());
		for (String facetName : handle.getFacetNames()) {
			System.out.println(facetName);
		}
	}
	
	@Test
	public void testSuggest() {
		
	}
}
