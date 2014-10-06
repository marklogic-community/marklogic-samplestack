package com.marklogic.samplestack.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.query.QueryManager;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.service.MarkLogicOperations;

@Component
public abstract class MarkLogicBaseService {

	@Autowired
	protected MarkLogicOperations operations;

	@Autowired
	protected Clients clients;

	protected JSONDocumentManager jsonDocumentManager(ClientRole role) {
		return clients.get(role).newJSONDocumentManager();
	};
	
	protected QueryManager queryManager(ClientRole role) {
		return clients.get(role).newQueryManager();
	}

	@Autowired
	protected ObjectMapper mapper;

}
