package com.marklogic.samplestack.impl;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.service.MarkLogicOperations;

public abstract class AbstractMarkLogicDataService {

	@Autowired
	protected MarkLogicOperations operations;
	
	protected JSONDocumentManager jsonDocumentManager(ClientRole role) {
		return operations.newJSONDocumentManager(role);
	};
	
	@Autowired
	protected ObjectMapper mapper;

	
	protected String generateUri(String prefix) {
		return prefix + UUID.randomUUID() + ".json";
	}
}
