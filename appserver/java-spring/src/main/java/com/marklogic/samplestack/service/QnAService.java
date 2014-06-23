package com.marklogic.samplestack.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.domain.QnADocumentResults;


public interface QnAService {

	/** 
	 * Search for a particular string, as entered in the Samplestack search box.
	 * @param role ClientRole on whose behalf to execute the search.
	 * @param question The question/terms to search for
	 * @param start The index of the first result in the result set.
	 * @return A QuestionResults object containing results/snippets for the search.
	 */
	public QnADocumentResults search(ClientRole role, String question, long start);
	
	/**
	 * Send a [JSON] raw structured query to the server, using the options
	 * configured for a QuestionAndAnswer search.
	 * @param role ClientRole on whose behalf to execute the search.
	 * @param structuredQuery A JSON structured query payload, as a JSONNode.
	 * @return A QuestionResults object containing results/snippets for the search.
	 */
	public ObjectNode rawSearch(ClientRole role, JsonNode structuredQuery, long start);
	//TODO better to provide InputStream method too to avoid parse?  or better to have valid json assured?
	
	/**
	 * Publishes a new Question to the Samplestack database.
	 * @param userName The userName who asked the question
	 * @param question The new completed details section.
	 * @return The QnADocument created by the ask operation
	 */
	public QnADocument ask(String userName, QnADocument question);

	/**
	 * Adds an answer to an existing QnADocument
	 * @param userName The userName of the contributor adding an answer to the question.
	 * @param questionId The identifier for the question to be answered (document URI)
	 * @param answer The answer, in Markdown text representation
	 * @return The QnADocument as modified by the answer operation
	 */
	public QnADocument answer(String userName, String questionId, String answer);
	
	/**
	 * Adds a vote-up score to a particular question or answer.
	 * @param contributor The contributor who is voting on the question or answer.
	 * @param postId the id of the question or answer to vote on.
	 */
	public void voteUp(Contributor contributor, String postId);
	
	/**
	 * Adds a vote-down score to a particular question or answer.
	 * @param contributor The contributor who is voting on the question or answer.
	 * @param postId the id of the question or answer to vote on.
	 */
	public void voteDown(Contributor contributor, String postId);

	/**
	 * Marks a particular answer as accepted.  Note -- requirement 
	 * that only owner may accept an answer is enforced in UI.
	 * In the service/data layer the author of the question
	 * isn't important or recorded.
	 * @param postId The identifier of the answer to be accepted.
	 */
	public QnADocument accept(String postId);

	/**
	 * Retrieves a QnADocument by id.
	 * @param id The id of the QnA document, which is the same as the id of the question.
	 * @return The QnADocument identified by id
	 */
	public QnADocument get(ClientRole role, String id);

	/**
     * Removes a QnA document from the database.  Not used by the runtime application.
	 * @param postId The id of the document to delete.
	 */
	public void delete(String postId);

	/**
	 * Adds a comment to a given post Id.
	 * @param userName The owner of the comment
	 * @param postId The target post id (question or answer) for the comment.
	 * @param text the text of the comment
	 * @return The updated QnADocument
	 */
	public QnADocument comment(String userName, String postId, String text);

	/**
	 * Removes all the QnA documents from the database.
	 * Convenient for testing.
	 */
	public void deleteAll();

}
