package com.marklogic.samplestack.service;

import com.marklogic.samplestack.Application.ClientRole;

public interface DatabaseClientDispenser {

	MarkLogicOperations getOperations(ClientRole role);
	
}
