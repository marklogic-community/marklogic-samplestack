package com.marklogic.sampleStack.service;

import com.marklogic.sampleStack.domain.Contributor;
import com.marklogic.sampleStack.domain.QuestionAndAnswerResults;
import com.marklogic.sampleStack.domain.QuestionAndAnswers;


public interface QuestionAndAnswerService {

	public QuestionAndAnswerResults search(String question);

	public QuestionAndAnswers ask(Contributor user, String question);

	public QuestionAndAnswers answer(Contributor user, QuestionAndAnswers toAnswer, String string);

	public void accept(String question, Long id);

}
