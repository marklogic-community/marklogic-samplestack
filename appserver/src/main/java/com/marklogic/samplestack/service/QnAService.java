package com.marklogic.samplestack.service;

import com.marklogic.client.query.RawStructuredQueryDefinition;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.domain.QnADocumentResults;


public interface QnAService {

	/** 
	 * Search for a particular string, as entered in the Samplestack search box.
	 * @param question The question/terms to search for
	 * @return A QuestionResults object containing results/snippets for the search.
	 */
	public QnADocumentResults search(String question);
	
	/**
	 * Send a [JSON] raw structured query to the server, using the options
	 * configured for a QuestionAndAnswer search.
	 * @param structuredQuery A JSON structured query payload.
	 * @return A QuestionResults object containing results/snippets for the search.
	 */
	public QnADocumentResults search(RawStructuredQueryDefinition structuredQuery);
	
	/**
	 * Publishes a new Question to the Samplestack database.
	 * @param contributor THe contributor who asks this question.
	 * @param question The new completed details section.
	 * @return
	 */
	public QnADocument ask(Contributor contributor, QnADocument question);

	public QnADocument answer(Contributor contributor, String questionId, String string);
	
	public void voteUp(Contributor contributor, String postId);
	
	public void voteDown(Contributor contributor, String postId);

	public void accept(Contributor contributor, String postId);

	public QnADocument get(String id);

	/**
	 * The application doesn't ever delete questions, but an API should provide that capability.
	 * TODO maybe delete?  Is it better to design for no deletes?
	 * @param id
	 */
	public void delete(String id);
}
