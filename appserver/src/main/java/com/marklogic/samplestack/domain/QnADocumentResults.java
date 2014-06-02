package com.marklogic.samplestack.domain;

import com.marklogic.client.io.SearchHandle;

/**
 * Wraps a SearchResponse so that I can get sparse data out of the payload.
 *
 */
public class QnADocumentResults {

	private SearchHandle results;
	
	public QnADocumentResults(SearchHandle results) {
		this.setResults(results);
	}

	public boolean hasResults() {
		return this.getResults().getTotalResults() > 0;
	}

	public QnADocument get(int i) {
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
