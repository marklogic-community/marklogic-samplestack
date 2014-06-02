package com.marklogic.samplestack.impl;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.samplestack.service.MarkLogicOperations;

public abstract class AbstractMarkLogicDataService {

	@Autowired
	protected MarkLogicOperations operations;
	
	@Autowired
	protected JSONDocumentManager jsonDocumentManager;
	
	@Bean 
	protected JSONDocumentManager jsonDocumentManager() {
		return operations.newJSONDocumentManager();
	};
	
	@Autowired
	protected ObjectMapper mapper;

	
	protected String generateUri(String prefix) {
		return prefix + UUID.randomUUID() + ".json";
	}
}
