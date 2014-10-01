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
package com.marklogic.samplestack.integration.service;

import static com.marklogic.samplestack.SamplestackConstants.QUESTIONS_DIRECTORY;

import java.io.IOException;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.pojo.PojoRepository;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.exception.SamplestackIOException;
import com.marklogic.samplestack.service.ContributorAddOnService;
import com.marklogic.samplestack.service.MarkLogicOperations;
import com.marklogic.samplestack.service.QnAService;
import com.marklogic.samplestack.testing.Utils;

public abstract class MarkLogicIntegrationIT {

	@Autowired
	protected MarkLogicOperations operations;

	@Autowired
	protected ContributorAddOnService contributorService;

	@Autowired
	protected PojoRepository<Contributor, String> contributorRepository;

	@Autowired
	protected QnAService qnaService;

	@Autowired
	protected ObjectMapper mapper;

	protected TestDataBuilder testDataBuilder;

	protected JSONDocumentManager contribManager;

	protected ObjectNode content;

	protected ObjectNode getTestJson(String testPath) {
		ClassPathResource r = new ClassPathResource(testPath);
		try {
			return mapper.readValue(r.getInputStream(), ObjectNode.class);
		} catch (IOException e) {
			throw new SamplestackIOException(e);
		}
	}

	@PostConstruct
	public void cleanout() {
		operations.deleteDirectory(ClientRole.SAMPLESTACK_CONTRIBUTOR,
				QUESTIONS_DIRECTORY);
		contributorRepository.deleteAll();
		contributorService.store(Utils.joeUser);
		contributorService.store(Utils.maryAdmin);
		testDataBuilder = new TestDataBuilder(operations, qnaService);
		// the following method is a slow way to make questions
		// which are cached on the filesystem for testing purposes.
		// testDataBuilder.generateTestCorpus();
		testDataBuilder.setupSearch();
	}
}
