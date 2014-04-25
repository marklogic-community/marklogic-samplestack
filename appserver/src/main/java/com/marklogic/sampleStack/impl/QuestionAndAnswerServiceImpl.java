package com.marklogic.sampleStack.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.marklogic.sampleStack.domain.ApplicationUser;
import com.marklogic.sampleStack.domain.QuestionAndAnswerResults;
import com.marklogic.sampleStack.domain.QuestionAndAnswers;
import com.marklogic.sampleStack.service.MarkLogicOperations;
import com.marklogic.sampleStack.service.QuestionAndAnswerService;

@Component
public class QuestionAndAnswerServiceImpl implements QuestionAndAnswerService {

	private final Logger logger = LoggerFactory
			.getLogger(QuestionAndAnswerServiceImpl.class);
	
	@Autowired
	private MarkLogicOperations operations;
	
	@Override
	public QuestionAndAnswerResults search(String question) {
		return new QuestionAndAnswerResults(operations.searchDirectory("/question/", question));
	}

	@Override
	public QuestionAndAnswers ask(ApplicationUser user, String question) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public QuestionAndAnswers answer(ApplicationUser user,
			QuestionAndAnswers toAnswer, String string) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void accept(String question, Long id) {
		// TODO Auto-generated method stub

	}

}
