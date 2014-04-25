package com.marklogic.sampleStack.service;

import com.marklogic.sampleStack.domain.ApplicationUser;
import com.marklogic.sampleStack.domain.QuestionAndAnswerResults;
import com.marklogic.sampleStack.domain.QuestionAndAnswers;


public interface QuestionAndAnswerService {

	public QuestionAndAnswerResults search(String question);

	public QuestionAndAnswers ask(ApplicationUser user, String question);

	public QuestionAndAnswers answer(ApplicationUser user, QuestionAndAnswers toAnswer, String string);

	public void accept(String question, Long id);

}
