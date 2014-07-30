/*
 * Copyright 2012-2014 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.samplestack.impl;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.SamplestackType;
import com.marklogic.samplestack.service.MarkLogicOperations;

/**
 * Abstract class providing shared functionality for storing and querying JSON documents in MarkLogic.
 */
public abstract class AbstractMarkLogicDataService {

	@Autowired
	protected MarkLogicOperations operations;
	
	protected JSONDocumentManager jsonDocumentManager(ClientRole role) {
		return operations.newJSONDocumentManager(role);
	};
	
	@Autowired
	protected ObjectMapper mapper;

	
	protected String generateUri(SamplestackType type) {
		return type.directoryName() + UUID.randomUUID() + ".json";
	}

}
