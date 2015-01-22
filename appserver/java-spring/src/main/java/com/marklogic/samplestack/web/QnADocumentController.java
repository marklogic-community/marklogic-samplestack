/*
 * Copyright 2012-2015 MarkLogic Corporation
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
package com.marklogic.samplestack.web;

import org.joda.time.DateTimeZone;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.InitialQuestion;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.exception.SampleStackDataIntegrityException;
import com.marklogic.samplestack.exception.SamplestackInvalidParameterException;
import com.marklogic.samplestack.exception.SamplestackNotFoundException;
import com.marklogic.samplestack.exception.SamplestackSearchException;
import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.service.ContributorService;
import com.marklogic.samplestack.service.QnAService;

/**
 * Controller to handle endpoints related to questions and answers.
 */
@RestController
public class QnADocumentController {

	@SuppressWarnings("unused")
	private final Logger logger = LoggerFactory
			.getLogger(QnADocumentController.class);

	@Autowired
	private QnAService qnaService;

	@Autowired
	ObjectMapper mapper;

	@Autowired
	private ContributorService contributorService;

	/** 
	 * Searches for QnADocuments and returns search results to request body
	 * @param q A search string (See Search API docs)
	 * @param start The index of the first return result.
	 * @return A Search API JSON response containing matches, facets and snippets.
	 */
	@RequestMapping(value = "v1/questions", method = RequestMethod.GET)
	public @ResponseBody
	JsonNode getQnADocuments(@RequestParam(required = false) String q,
			@RequestParam(required = false, defaultValue = "1") long start) {
		if (q == null) {
			q = "sort:active";
		}
		ObjectNode combinedQuery = mapper.createObjectNode();
		ObjectNode qtext = combinedQuery.putObject("search");
		qtext.put("qtext",q);
		return qnaService.rawSearch(ClientRole.securityContextRole(), combinedQuery, start, DateTimeZone.forID("US/Pacific"));
	}

	/**
	 * Exposes endpoint for asking a question.
	 * @param initialQuestion A POJO constructed from the request body.
	 * @return The newly-created QnADocument's JSON node.
	 */
	@RequestMapping(value = "v1/questions", method = RequestMethod.POST)
	public @ResponseBody
	@PreAuthorize("hasRole('ROLE_CONTRIBUTORS')")
	@ResponseStatus(HttpStatus.CREATED)
	JsonNode ask(@RequestBody InitialQuestion initialQuestion) {
		Contributor asker = contributorService.getByUserName(ClientRole.securityContextUserName());
		QnADocument answered = qnaService.ask(asker, initialQuestion);
		return answered.getJson();
	}

	/**
	 * Gets a QnADocument based on the ID in the URL path.
	 * @param id The id of the document to retrieve.
	 * @return The QnADocument's JSON with id= id.
	 */
	@RequestMapping(value = "v1/questions/{id}", method = RequestMethod.GET)
	public @ResponseBody
	JsonNode get(@PathVariable(value = "id") String id) {
		Contributor contributor = contributorService.getByUserName(ClientRole.securityContextUserName());
		QnADocument qnaDoc = qnaService.get(ClientRole.securityContextRole(), contributor, id);
		// if URL was accessed with under-privileged role, qnaDoc will be null.
		if (qnaDoc == null) {
			throw new SamplestackNotFoundException();
		} else {
			return qnaDoc.getJson();
		}
	}

	/**
	 * Deletes a QnADocument by id
	 * @param id the id of the QnADocument to delete.
	 * @return An empty response, 204 HTTP status.
	 */
	@RequestMapping(value = "v1/questions/{id}", method = RequestMethod.DELETE)
	public @ResponseBody
	@PreAuthorize("hasRole('ROLE_ADMINS')")
	ResponseEntity<?> delete(@PathVariable(value = "id") String id) {
		qnaService.delete(id);
		return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
	}

	/**
	 * Endpoint to provide an answer to an outstanding question.
	 * @param answer The JSON node containing an answer.
	 * @param id The id of the question to answer.
	 * @return The updated QnADocument's JSON node.
	 */
	@RequestMapping(value = "v1/questions/{id}/answers", method = RequestMethod.POST)
	public @ResponseBody
	@PreAuthorize("hasRole('ROLE_CONTRIBUTORS')")
	@ResponseStatus(HttpStatus.CREATED)
	JsonNode answer(@RequestBody JsonNode answer,
			@PathVariable(value = "id") String id) {
		String answerId = id;
		Contributor owner = contributorService.getByUserName(ClientRole.securityContextUserName());
		QnADocument answered = qnaService.answer(owner, answerId, answer.get("text").asText());
		return answered.getJson();
	}
	
	/**
	 * Exposes endpoint to accept an answer.
	 * @param answerIdPart The id of the answer that's deemed suitable to the contributor.
	 * @return An updated QnADocument's JSON node.
	 */
	@RequestMapping(value = "v1/questions/{id}/answers/{answerId}/accept", method = RequestMethod.POST)
	public @ResponseBody
	@PreAuthorize("hasRole('ROLE_CONTRIBUTORS')")
	JsonNode accept(@PathVariable(value = "answerId") String answerIdPart) {
		String userName = ClientRole.securityContextUserName();
		String answerId = answerIdPart;
		Contributor accepter = contributorService.getByUserName(userName);
		QnADocument toAccept = qnaService.findOne(ClientRole.SAMPLESTACK_CONTRIBUTOR, "id:"+answerId, 1, null);
		if (toAccept.getOwnerUserName().equals(userName)) {
			QnADocument accepted = qnaService.accept(accepter, answerId);
			return accepted.getJson();
		}
		else {
			throw new SampleStackDataIntegrityException("Current user does not match owner of question");
		}
	}
	
	/**
	 * Exposes an endpoint to comment on a question.
	 * @param comment The JSON payload containing a comment.
	 * @param questionId The id of the question on which to comment.
	 * @return An updated QnADocument's JSON node.
	 */
	@RequestMapping(value = "v1/questions/{id}/comments", method = RequestMethod.POST)
	@ResponseStatus(HttpStatus.CREATED)
	public @ResponseBody
	@PreAuthorize("hasRole('ROLE_CONTRIBUTORS')")
	JsonNode comment(@RequestBody JsonNode comment,
			@PathVariable(value = "id") String questionId) {
		String postId = questionId;
		Contributor commenter = contributorService.getByUserName(ClientRole.securityContextUserName());
		QnADocument toCommentOn = qnaService.comment(commenter, postId, comment.get("text").asText());
		return toCommentOn.getJson();
	}
	
	/**
	 * Exposes an endpoint to give a question an upvote.
	 * @param questionId The question's id.
	 * @return An updated QnADocument's JSON node.
	 */
	@RequestMapping(value = "v1/questions/{id}/upvotes", method = RequestMethod.POST)
	@ResponseStatus(HttpStatus.CREATED)
	public @ResponseBody
	@PreAuthorize("hasRole('ROLE_CONTRIBUTORS')")
	JsonNode voteUp(@PathVariable(value = "id") String questionId) {
		String postId = questionId;
		Contributor voter = contributorService.getByUserName(ClientRole.securityContextUserName());
		QnADocument toVoteOn = qnaService.voteUp(voter, postId);
		return toVoteOn.getJson();
	}
	
	/**
	 * Exposes an endpoint to give a question an downvote.
	 * @param questionId The question's id.
	 * @return An updated QnADocument's JSON node.
	 */
	@RequestMapping(value = "v1/questions/{id}/downvotes", method = RequestMethod.POST)
	@ResponseStatus(HttpStatus.CREATED)
	public @ResponseBody
	@PreAuthorize("hasRole('ROLE_CONTRIBUTORS')")
	JsonNode voteDown(@PathVariable(value = "id") String questionId) {
		String postId = questionId;
		Contributor voter = contributorService.getByUserName(ClientRole.securityContextUserName());
		QnADocument toVoteOn = qnaService.voteDown(voter, postId);
		return toVoteOn.getJson();
	}
	
	/**
	 * Exposes an endpoint to give an answer an upvote.
	 * @param answerIdPart The part of the URL that encodes the answer's id.
	 * @return An updated QnADocument's JSON node.
	 */
	@RequestMapping(value = "v1/questions/{id}/answers/{answerId}/upvotes", method = RequestMethod.POST)
	@ResponseStatus(HttpStatus.CREATED)
	public @ResponseBody
	@PreAuthorize("hasRole('ROLE_CONTRIBUTORS')")
	JsonNode upVoteAnswer(@RequestBody JsonNode comment,
			@PathVariable(value = "answerId") String answerIdPart) {
		String answerId = answerIdPart;
		Contributor voter = contributorService.getByUserName(ClientRole.securityContextUserName());
		QnADocument toVoteOn = qnaService.voteUp(voter, answerId);
		return toVoteOn.getJson();
	}
	

	/**
	 * Exposes an endpoint to give an answer a downvote.
	 * @param answerIdPart The part of the URL that encodes the answer's id.
	 * @return An updated QnADocument's JSON node.
	 */
	@RequestMapping(value = "v1/questions/{id}/answers/{answerId}/downvotes", method = RequestMethod.POST)
	@ResponseStatus(HttpStatus.CREATED)
	public @ResponseBody
	@PreAuthorize("hasRole('ROLE_CONTRIBUTORS')")
	JsonNode downVoteAnswer(@PathVariable(value = "answerId") String answerIdPart) {
		String answerId = answerIdPart;
		Contributor voter = contributorService.getByUserName(ClientRole.securityContextUserName());
		QnADocument toVoteOn = qnaService.voteDown(voter, answerId);
		return toVoteOn.getJson();
	}
	
	/**
	 * Exposes an endpoint to comment on an answer.
	 * @param comment The JSON payload containing a comment.
	 * @param answerIdPart The part of the URL that encodes the answer's id.
	 * @return An updated QnADocument's JSON node.
	 */
	@RequestMapping(value = "v1/questions/{id}/answers/{answerId}/comments", method = RequestMethod.POST)
	@ResponseStatus(HttpStatus.CREATED)
	public @ResponseBody
	@PreAuthorize("hasRole('ROLE_CONTRIBUTORS')")
	JsonNode commentAnswer(@RequestBody JsonNode comment,
			@PathVariable(value = "answerId") String answerIdPart) {
		String answerId = answerIdPart;
		Contributor commenter = contributorService.getByUserName(ClientRole.securityContextUserName());
		QnADocument toCommentOn = qnaService.comment(commenter, answerId, comment.get("text").asText());
		return toCommentOn.getJson();
	}
	
	/**
	 * Exposes an endpoint for searching QnADocuments.
	 * @param combinedQuery A JSON combined query.
	 * @param start The index of the first result to return.
	 * @return A Search Results JSON response.
	 */
	@RequestMapping(value = "v1/search", method = RequestMethod.POST)
	public @ResponseBody
	JsonNode search(@RequestBody ObjectNode combinedQuery,
			@RequestParam(defaultValue = "1", required = false) long start) {

		ObjectNode combinedQueryObject = (ObjectNode) combinedQuery.get("search");
		if (combinedQueryObject == null) {
			throw new SamplestackSearchException("A Samplestack search must have payload with root key \"search\"");
		}
		JsonNode postedStartNode = combinedQueryObject.get("start");
		if (postedStartNode != null) {
			start = postedStartNode.asLong();
			combinedQueryObject.remove("start");
		}
		JsonNode postedTimeZone = combinedQueryObject.get("timezone");
		DateTimeZone userTimeZone = DateTimeZone.getDefault();
		if (postedTimeZone != null) {
			try {
				userTimeZone = DateTimeZone.forID(postedTimeZone.asText());
			} catch (IllegalArgumentException e) {
				throw new SamplestackInvalidParameterException("Received unrecognized timezone from browser: " + postedTimeZone.asText());
			}
			combinedQueryObject.remove("timezone");
		}
		// TODO review for presence/absense of date facet as performance question.
		return qnaService.rawSearch(ClientRole.securityContextRole(), combinedQuery, start, userTimeZone);
	}

}
