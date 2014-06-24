package com.marklogic.samplestack.domain;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.DocumentPage;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.SearchHandle;

/**
 * Wraps a SearchResponse so that I can get sparse data out of the payload.
 */
public class QnADocumentResults {

	private SearchHandle results;
	
	// cache of documents from the search results
	private List<QnADocument> sidecar;
	
	public QnADocumentResults(SearchHandle results, DocumentPage page) {
		this.setResults(results);
		List<QnADocument> sidecar = new ArrayList<QnADocument>();
		while (page.hasNext()) {
			JacksonHandle jacksonHandle = page.next().getContent(new JacksonHandle());
			QnADocument newDocument = new QnADocument((ObjectNode) jacksonHandle.get());
			sidecar.add(newDocument);
		}
		this.sidecar = sidecar;
	}

	public QnADocument get(int i) {
		return sidecar.get(i);
	}

	public void setResults(SearchHandle results) {
		this.results = results;
	}

	public void setSidecar(List<QnADocument> sidecar) {
		this.sidecar = sidecar;
	}

}
