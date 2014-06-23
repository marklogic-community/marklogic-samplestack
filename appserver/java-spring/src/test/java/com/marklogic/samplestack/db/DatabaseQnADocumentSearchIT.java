package com.marklogic.samplestack.db;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.io.IOException;

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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.DocumentPage;
import com.marklogic.client.query.QueryManager.QueryView;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.SamplestackType;
import com.marklogic.samplestack.exception.SamplestackIOException;
import com.marklogic.samplestack.impl.DatabaseContext;
import com.marklogic.samplestack.service.MarkLogicOperations;

/**
 * Tests the functionality of the search services installed on the server.
 * Depends on database/options/questions.json Depends on security setup
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = DatabaseContext.class)
@Category(DatabaseExtensionTest.class)
public class DatabaseQnADocumentSearchIT {

	private final Logger logger = LoggerFactory
			.getLogger(DatabaseQnADocumentSearchIT.class);


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
		DocumentPage results = operations.searchDirectory(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, SamplestackType.CONTRIBUTORS, "");
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
	public void testTagSearch() throws JsonProcessingException {
		JsonNode query;
		ObjectNode results;
		try {
			query = mapper
					.readValue("{\"query\":{\"qtext\":\"tag:monotouch\"}}",
							JsonNode.class);
			results = operations.rawStructuredSearch(
					ClientRole.SAMPLESTACK_CONTRIBUTOR,
					SamplestackType.QUESTIONS, query, 1, QueryView.FACETS);

			logger.debug("Query Results:" + mapper.writeValueAsString(results));
		} catch (IOException e) {
			throw new SamplestackIOException(e);
		}
		assertNotNull("JSON has facet results", results.get("facets")
				.get("tag"));
	}

	@Test
	public void testStructuredTagSearch() {
		JsonNode query;
		ObjectNode results = null;
		try {
			query = mapper
					.readValue(
							"{\"query\":{\"value-constraint-query\":{\"constraint-name\":\"tag\",\"text\":\"monotouch\"}}}",
							JsonNode.class);
			results = operations.rawStructuredSearch(
					ClientRole.SAMPLESTACK_CONTRIBUTOR,
					SamplestackType.QUESTIONS, query, 1, QueryView.FACETS);

			logger.debug("Query Results:" + mapper.writeValueAsString(results));
		} catch (IOException e) {
			throw new SamplestackIOException(e);
		}
		assertNotNull("JSON has facet results", results.get("facets")
				.get("tag"));
	}

	@Test
	public void testSuggest() {

	}
}
