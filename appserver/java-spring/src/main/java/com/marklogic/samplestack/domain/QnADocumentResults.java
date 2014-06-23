package com.marklogic.samplestack.domain;

import java.util.List;

import com.marklogic.client.io.SearchHandle;

/**
 * Wraps a SearchResponse so that I can get sparse data out of the payload.
 */
public class QnADocumentResults {

	private SearchHandle results;
	
	// cache of documents from the search results
	private List<QnADocument> sidecar;
	
	public QnADocumentResults(SearchHandle results) {
		this.setResults(results);
	}

	public boolean hasResults() {
		return this.getResults().getTotalResults() > 0;
	}

	public QnADocument get(int i) {
		return sidecar.get(i);
	}

	public SearchHandle getResults() {
		return results;
	}

	public void setResults(SearchHandle results) {
		this.results = results;
	}

	public void setSidecar(List<QnADocument> sidecar) {
		this.sidecar = sidecar;
	}

}
