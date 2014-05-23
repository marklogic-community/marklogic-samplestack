package com.marklogic.sampleStack.impl;

import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.sampleStack.service.MarkLogicOperations;

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

	

	private static Random ids = new Random();
	
	protected String generateUri(String prefix) {
		return prefix + Math.abs(ids.nextLong());
	}
}
