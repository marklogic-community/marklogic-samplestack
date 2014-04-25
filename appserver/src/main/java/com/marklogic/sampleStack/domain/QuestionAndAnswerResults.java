package com.marklogic.sampleStack.domain;

import com.marklogic.client.io.SearchHandle;

/**
 * Wraps a SearchResponse so that I can get sparse data out of the payload.
 *
 */
public class QuestionAndAnswerResults {

	private SearchHandle results;
	
	public QuestionAndAnswerResults(SearchHandle results) {
		this.setResults(results);
	}

	public boolean hasResults() {
		return this.getResults().getTotalResults() > 0;
	}

	public QuestionAndAnswers get(int i) {
		// TODO Auto-generated method stub
		return null;
	}

	public SearchHandle getResults() {
		return results;
	}

	public void setResults(SearchHandle results) {
		this.results = results;
	}

}
