package com.marklogic.samplestack.service;

import org.springframework.beans.factory.annotation.Autowired;

import com.fasterxml.jackson.databind.ObjectMapper;

public abstract class MarkLogicIntegrationTest {

	@Autowired
	protected MarkLogicOperations operations;
	
	@Autowired
	protected ContributorService contributorService;

	@Autowired
	protected ObjectMapper mapper;

}
