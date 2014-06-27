package com.marklogic.samplestack.service;

import java.io.IOException;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.samplestack.Utils;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.SamplestackType;
import com.marklogic.samplestack.exception.SamplestackIOException;

public abstract class MarkLogicIntegrationTest {

	@Autowired
	protected MarkLogicOperations operations;

	@Autowired
	protected ContributorService contributorService;

	@Autowired
	protected QnAService qnaService;
	
	@Autowired
	protected ObjectMapper mapper;

	protected JSONDocumentManager contribManager;

	protected ObjectNode content;

	public void setup(String testUri) {
		// write a document using writer connection.
		content = mapper.createObjectNode();
		content.put("body", "content");
		contribManager = operations
				.newJSONDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR);
		contribManager.write(testUri, new JacksonHandle(content));
	}

	protected JsonNode getTestJson(String testPath) {
		ClassPathResource r = new ClassPathResource(testPath);
		try {
			return mapper.readValue(r.getInputStream(), JsonNode.class);
		} catch (IOException e) {
			throw new SamplestackIOException(e);
		}
	}

	@PostConstruct
	public void cleanout() {
		operations.deleteDirectory(ClientRole.SAMPLESTACK_CONTRIBUTOR,
				SamplestackType.QUESTIONS);
		operations.deleteDirectory(ClientRole.SAMPLESTACK_CONTRIBUTOR,
				SamplestackType.CONTRIBUTORS);
		contributorService.store(Utils.joeUser);
		contributorService.store(Utils.maryUser);
	}
}
