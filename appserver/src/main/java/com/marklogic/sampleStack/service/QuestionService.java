package com.marklogic.sampleStack.service;

import com.marklogic.sampleStack.domain.Contributor;
import com.marklogic.sampleStack.domain.QuestionAndAnswerResults;
import com.marklogic.sampleStack.domain.Question;


public interface QuestionService {

	public QuestionAndAnswerResults search(String question);

	/**
	 * Publishes a new Question to the samplestack database.
	 * @param user THe contributor who asks this question.
	 * @param question
	 * @return
	 */
	public Question ask(Contributor user, Question question);

	public Question answer(Contributor user, Question toAnswer, String string);

	public void accept(String question, String id);

	public Question get(String l);

}
