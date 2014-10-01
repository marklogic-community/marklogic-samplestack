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
package com.marklogic.samplestack.mock;

import java.io.IOException;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.InitialQuestion;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.exception.SamplestackIOException;
import com.marklogic.samplestack.service.QnAService;

@Component
/**
 * A mock version of a QnAService that provides fast and faked data for unit tests.
 */
public class MockQnAService implements QnAService {

	private QnADocument asked;
	private QnADocument answered;
	private ObjectNode emptySearchResults;
	
	@Autowired
	private ObjectMapper mapper;

	protected JsonNode getTestJson(String testPath) {
		ClassPathResource r = new ClassPathResource(testPath);
		try {
			return mapper.readValue(r.getInputStream(), JsonNode.class);
		} catch (IOException e) {
			throw new SamplestackIOException(e);
		}
	}

	public MockQnAService() { }
	
	@PostConstruct
	public void setupDocuments() {
		
		asked = new QnADocument((ObjectNode) getTestJson("questions/20864442.json"));
		answered = new QnADocument((ObjectNode) getTestJson("questions/8450f8a4-2782-4c8a-9fd9-b83bcacc5018.json"));
		emptySearchResults = (ObjectNode) getTestJson("searchresults/mocksearchempty.json");
		// searchResults = (ObjectNode) getTestJson("searchresults/mocksearch.json");
		
	}
	
	@Override
	public QnADocument findOne(ClientRole role, String question,
			long start) {
		return asked;
	}

	@Override
	public ObjectNode rawSearch(ClientRole role, ObjectNode structuredQuery,
			long start) {
		return emptySearchResults;
	}

	@Override
	public QnADocument ask(Contributor user, InitialQuestion question) {
		return answered;
	}

	@Override
	public QnADocument answer(Contributor contributor, String questionId, String answer) {
		return answered;
	}

	@Override
	public QnADocument voteUp(Contributor voter, String postId) {
		return answered;
	}

	@Override
	public QnADocument voteDown(Contributor voter, String postId) {
		return asked;

	}

	@Override
	public QnADocument accept(String postId) {
		return answered;
	}

	@Override
	public QnADocument get(ClientRole role, String id) {
		return asked;
	}

	@Override
	public void delete(String postId) {
		//
	}

	@Override
	public QnADocument comment(Contributor commenter, String postId, String text) {
		return asked;
	}

	@Override
	public void deleteAll() {
		//
	}

	@Override
	public ObjectNode rawSearch(ClientRole role, ObjectNode structuredQuery,
			long start, boolean includeDates) {
		return rawSearch(role, structuredQuery, start);
	}


}
