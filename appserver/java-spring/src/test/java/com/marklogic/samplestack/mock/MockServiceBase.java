package com.marklogic.samplestack.mock;

import java.io.IOException;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.exception.SamplestackIOException;

public class MockServiceBase {

	protected QnADocument asked;
	protected QnADocument answered;
	protected ObjectNode emptySearchResults;
	
	@Autowired
	protected ObjectMapper mapper;

	protected JsonNode getTestJson(String testPath) {
		ClassPathResource r = new ClassPathResource(testPath);
		try {
			return mapper.readValue(r.getInputStream(), JsonNode.class);
		} catch (IOException e) {
			throw new SamplestackIOException(e);
		}
	}

	@PostConstruct
	public void setupDocuments() {
		
		asked = new QnADocument((ObjectNode) getTestJson("questions/20864442.json"));
		answered = new QnADocument((ObjectNode) getTestJson("questions/8450f8a4-2782-4c8a-9fd9-b83bcacc5018.json"));
		emptySearchResults = (ObjectNode) getTestJson("searchresults/mocksearchempty.json");
		// searchResults = (ObjectNode) getTestJson("searchresults/mocksearch.json");
		
	}
}
