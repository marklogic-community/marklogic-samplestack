package com.marklogic.sampleStack.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.DocumentUriTemplate;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.extra.jackson.JacksonHandle;
import com.marklogic.sampleStack.domain.Contributor;
import com.marklogic.sampleStack.domain.Question;
import com.marklogic.sampleStack.domain.QuestionAndAnswerResults;
import com.marklogic.sampleStack.service.MarkLogicOperations;
import com.marklogic.sampleStack.service.QuestionService;

@Component
public class QuestionServiceImpl extends AbstractMarkLogicDataService implements QuestionService {

	private final Logger logger = LoggerFactory
			.getLogger(QuestionServiceImpl.class);
	
	private static String DIRNAME = "/qna/";
	
	private static String idFromUri(String uri) {
		return uri.replace(DIRNAME, "").replace(".json", "");
	}
	private static String uriFromId(String id) {
		return DIRNAME + id + ".json";
	}
	
	
	@Autowired
	private MarkLogicOperations operations;
	
	@Override
	public QuestionAndAnswerResults search(String question) {
		return new QuestionAndAnswerResults(operations.searchDirectory("/question/", question));
	}

	@Override
	public Question ask(Contributor user, Question question) {
		String documentUri = generateUri(DIRNAME);
		question.setId(documentUri);
		jsonDocumentManager
					.write(documentUri, 
						new JacksonHandle(question.getJson()),
						new ServerTransform("ask"));
								
		return new Question((ObjectNode) operations.getJsonDocument(documentUri));
	}

	@Override
	public Question answer(Contributor user,
			Question toAnswer, String string) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void accept(String question, String id) {
		// TODO Auto-generated method stub

	}

	@Override
	public Question get(String id) {
		logger.debug(id);
		JsonNode json = operations.getJsonDocument(uriFromId(id));
		Question question = new Question((ObjectNode) json);
		return question;
	}

}
