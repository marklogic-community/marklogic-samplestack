package com.marklogic.samplestack.service;

import org.springframework.beans.factory.annotation.Autowired;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.samplestack.domain.ClientRole;

public abstract class MarkLogicIntegrationTest {

	@Autowired
	protected MarkLogicOperations operations;

	@Autowired
	protected ContributorService contributorService;

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
}
