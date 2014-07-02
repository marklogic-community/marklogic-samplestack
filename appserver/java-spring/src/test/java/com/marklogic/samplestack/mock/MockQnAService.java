package com.marklogic.samplestack.mock;

import java.io.IOException;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.exception.SamplestackIOException;
import com.marklogic.samplestack.service.QnAService;

@Component
public class MockQnAService implements QnAService {

	QnADocument q1;
	QnADocument q2;
	
	@Autowired
	private ObjectMapper mapper;

	protected JsonNode getTestJson(String testPath) {
		ClassPathResource r = new ClassPathResource(testPath);
		try {
			return mapper.readValue(r.getInputStream(), JsonNode.class);
		} catch (IOException e) {
			throw new SamplestackIOException(e);
		}
	}

	public MockQnAService() { }
	
	@PostConstruct
	public void setupDocuments() {
		
		q1 = new QnADocument((ObjectNode) getTestJson("questions/20864442.json"));
		q2 = new QnADocument((ObjectNode) getTestJson("questions/3bb58db7-a2f3-401c-8515-469376c0520d.json"));
		
	}
	
	@Override
	public QnADocument findOne(ClientRole role, String question,
			long start) {
		return q1;
	}

	@Override
	public ObjectNode rawSearch(ClientRole role, JsonNode structuredQuery,
			long start) {
		return (ObjectNode) q1.getJson();
	}

	@Override
	public QnADocument ask(String userName, QnADocument question) {
		return q2;
	}

	@Override
	public QnADocument answer(String userName, String questionId, String answer) {
		return q2;
	}

	@Override
	public QnADocument voteUp(String userName, String postId) {
		return q2;
	}

	@Override
	public QnADocument voteDown(String userName, String postId) {
		return q1;

	}

	@Override
	public QnADocument accept(String postId) {
		return q2;
	}

	@Override
	public QnADocument get(ClientRole role, String id) {
		return q1;
	}

	@Override
	public void delete(String postId) {
		//
	}

	@Override
	public QnADocument comment(String userName, String postId, String text) {
		return q1;
	}

	@Override
	public void deleteAll() {
		//
	}


}
