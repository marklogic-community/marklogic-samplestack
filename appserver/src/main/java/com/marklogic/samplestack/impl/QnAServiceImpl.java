package com.marklogic.samplestack.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.extra.jackson.JacksonHandle;
import com.marklogic.client.io.SearchHandle;
import com.marklogic.client.query.RawStructuredQueryDefinition;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.domain.QnADocumentResults;
import com.marklogic.samplestack.service.MarkLogicOperations;
import com.marklogic.samplestack.service.QnAService;

@Component
public class QnAServiceImpl extends AbstractMarkLogicDataService implements QnAService {

	private final Logger logger = LoggerFactory
			.getLogger(QnAServiceImpl.class);
	
	private static String DIRNAME = "/qna/";
	
	private static String idFromUri(String uri) {
		return uri.replace(DIRNAME, "").replace(".json", "");
	}
	private static String uriFromId(String id) {
		return DIRNAME + id + ".json";
	}
	
	@Autowired
	private MarkLogicOperations operations;
	
	@Autowired
	private ServerTransform askTransform;
	
	
	@Override
	public QnADocumentResults search(String question) {
		return new QnADocumentResults(operations.searchDirectory("/qna/", question));
	}

	@Override
	public QnADocument ask(Contributor user, QnADocument question) {
		String documentUri = generateUri(DIRNAME);
		question.setId(documentUri);
		jsonDocumentManager
					.write(documentUri, 
						new JacksonHandle(question.getJson()),
						askTransform);
								
		return new QnADocument((ObjectNode) operations.getJsonDocument(documentUri));
	}

	@Override
	public QnADocument answer(Contributor user,
			QnADocument toAnswer, String string) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void accept(Contributor contributor, String answerId) {
		//PatchBuilder
	}

	@Override
	public QnADocument get(String id) {
		logger.debug(id);
		JsonNode json = operations.getJsonDocument(uriFromId(id));
		QnADocument question = new QnADocument((ObjectNode) json);
		return question;
	}
	
	@Override
	public QnADocumentResults search(
			RawStructuredQueryDefinition structuredQuery) {
		SearchHandle results = operations.search(structuredQuery);
		return new QnADocumentResults(results);
	}
	
	@Override
	public void voteUp(Contributor user, String postUri) {
		
	}
	@Override
	public void voteDown(Contributor user, String postUri) {
		
	}
	@Override
	public void delete(String id) {
		jsonDocumentManager.delete(uriFromId(id));
	}

}
