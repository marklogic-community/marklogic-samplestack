/*
 * Copyright 2012-2014 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.samplestack.service;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.InitialQuestion;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.security.ClientRole;

/**
 * Defines methods for manipulating question-and-answer documents.
 */
public interface QnAService {

	/**
	 * Search for a particular string, as entered in the Samplestack search box.
	 * 
	 * @param role
	 *            ClientRole on whose behalf to execute the search.
	 * @param queryString
	 *            The question/terms to search for
	 * @param start
	 *            The index of the first result in the result set.
	 * @return A QuestionResults object containing results/snippets for the
	 *         search.
	 */
	public QnADocument findOne(ClientRole role, String queryString, long start);

	/**
	 * Send a [JSON] raw structured query to the server, using the options
	 * configured for a QuestionAndAnswer search.
	 * 
	 * @param role
	 *            ClientRole on whose behalf to execute the search.
	 * @param structuredQuery
	 *            A JSON structured query payload, as a JSONNode.
	 * @param start
	 *            Index of the first result in the result set.
	 * @param qtext 
     *            0 or more Qtext to be anded with structured Query.
	 * @param includeDates
	 *            Include facet for date values
	 * @return A QuestionResults object containing results/snippets for the
	 *         search.
	 */
	public ObjectNode rawSearch(ClientRole role, ObjectNode structuredQuery,
			long start, ArrayNode qtext, boolean includeDates);
	
	/**
	 * Send a [JSON] raw structured query to the server, using the options
	 * configured for a QuestionAndAnswer search.
	 * 
	 * @param role
	 *            ClientRole on whose behalf to execute the search.
	 * @param structuredQuery
	 *            A JSON structured query payload, as a JSONNode.
	 * @param start
	 *            Index of the first result in the result set.
	 * @return A QuestionResults object containing results/snippets for the
	 *         search.
	 */
	public ObjectNode rawSearch(ClientRole role, ObjectNode structuredQuery,
			long start);
	

	/**
	 * Publishes a new Question to the Samplestack database.
	 * 
	 * @param user
	 *            The userName who asked the question
	 * @param question
	 *            The new completed details section.
	 * @return The QnADocument created by the ask operation
	 */
	public QnADocument ask(Contributor user, InitialQuestion question);

	/**
	 * Adds an answer to an existing QnADocument
	 * 
	 * @param contributor
	 *            The userName of the contributor adding an answer to the
	 *            question.
	 * @param questionId
	 *            The identifier for the question to be answered (document URI)
	 * @param answer
	 *            The answer, in Markdown text representation
	 * @return The QnADocument as modified by the answer operation
	 */
	public QnADocument answer(Contributor contributor, String questionId, String answer);

	/**
	 * Adds a vote-up score to a particular question or answer.
	 * 
	 * @param voter
	 *            The contributor who is voting on the question or answer.
	 * @param postId
	 *            the id of the question or answer to vote on.
	 * @return the modified QnADocument, with new score
	 */
	public QnADocument voteUp(Contributor voter, String postId);

	/**
	 * Adds a vote-down score to a particular question or answer.
	 * 
	 * @param voter
	 *            The contributor who is voting on the question or answer.
	 * @param postId
	 *            the id of the question or answer to vote on.
	 * @return the modified QnADocument, with new score
	 */
	public QnADocument voteDown(Contributor voter, String postId);

	/**
	 * Marks a particular answer as accepted. Note -- requirement that only
	 * owner may accept an answer is enforced in UI. In the service/data layer
	 * the author of the question isn't important or recorded.
	 * 
	 * @param postId
	 *            The identifier of the answer to be accepted.
	 */
	public QnADocument accept(String postId);

	/**
	 * Retrieves a QnADocument by id.
	 * 
	 * @param id
	 *            The id of the QnA document, which is the same as the id of the
	 *            question.
	 * @return The QnADocument identified by id
	 */
	public QnADocument get(ClientRole role, String id);

	/**
	 * Removes a QnA document from the database. Not used by the runtime
	 * application.
	 * 
	 * @param postId
	 *            The id of the document to delete.
	 */
	public void delete(String postId);

	/**
	 * Adds a comment to a given post Id.
	 * 
	 * @param owner
	 *            The owner of the comment
	 * @param postId
	 *            The target post id (question or answer) for the comment.
	 * @param text
	 *            the text of the comment
	 * @return The updated QnADocument
	 */
	public QnADocument comment(Contributor owner, String postId, String text);

	/**
	 * Removes all the QnA documents from the database. Convenient for testing.
	 */
	public void deleteAll();


}
