package com.marklogic.sampleStack.domain;

import java.util.List;

public class QuestionAndAnswers {

	public interface Answer {
		public Long getId();
	}
	
	private List<Answer> answers;
	
	
	public String getQuestion() {
		// TODO Auto-generated method stub
		return null;
	}

	public List<Answer> getAnswers() {
		return answers;
	}

}
