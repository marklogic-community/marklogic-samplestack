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
package com.marklogic.samplestack.impl;

import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.MarkLogicIOException;
import com.marklogic.client.Transaction;
import com.marklogic.client.document.DocumentMetadataPatchBuilder.Call;
import com.marklogic.client.document.DocumentPage;
import com.marklogic.client.document.DocumentPatchBuilder;
import com.marklogic.client.document.DocumentPatchBuilder.Position;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.DocumentMetadataHandle.Capability;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.marker.DocumentPatchHandle;
import com.marklogic.client.query.QueryManager.QueryView;
import com.marklogic.samplestack.domain.Answer;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.Comment;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.domain.SamplestackType;
import com.marklogic.samplestack.domain.SparseContributor;
import com.marklogic.samplestack.exception.SampleStackDataIntegrityException;
import com.marklogic.samplestack.exception.SamplestackIOException;
import com.marklogic.samplestack.service.ContributorService;
import com.marklogic.samplestack.service.QnAService;

@Component
/**
 * Implementation of the QnAService interface.
 */
public class QnAServiceImpl extends AbstractMarkLogicDataService implements
		QnAService {

	@Autowired
	private ContributorService contributorService;

	private final Logger logger = LoggerFactory.getLogger(QnAServiceImpl.class);

	private static SamplestackType type = SamplestackType.QUESTIONS;

	private static String idFromUri(String uri) {
		return uri.replace(".json", "");
	}

	private static String uriFromId(String id) {
		return id + ".json";
	}

	@Override
	public QnADocument findOne(ClientRole role, String stringQuery, long start) {
		DocumentPage page = operations.searchInClass(role,
				SamplestackType.QUESTIONS, stringQuery, start);
		if (page.hasNext()) {
			JacksonHandle jacksonHandle = page.next().getContent(
					new JacksonHandle());
			QnADocument newDocument = new QnADocument(
					(ObjectNode) jacksonHandle.get());
			return newDocument;
		} else {
			return null;
		}
	}

	@Override
	public QnADocument ask(String userName, QnADocument question) {
		String documentUri = generateUri(type);
		question.setId(idFromUri(documentUri));
		ServerTransform askTransform = new ServerTransform("ask");
		askTransform.put("userName", userName);

		jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).write(
				documentUri, new JacksonHandle(question.getJson()),
				askTransform);

		return new QnADocument((ObjectNode) operations.getJsonDocument(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, documentUri));
	}

	@Override
	/**
	 * Uses DocumentPatchBuilder to send a change to the QnADocument JSON.
	 * @param contributor
	 * 			The owner of the answer.
	 * @param toAnswerId
	 * 			The ID of the question that's being answererd.
	 * @param answer
	 * 			Markdown of this answer's body.
	 */
	public QnADocument answer(Contributor contributor, String toAnswerId, String answerText) {
		String documentUri = uriFromId(toAnswerId);
		DocumentPatchBuilder patchBuilder = jsonDocumentManager(
				ClientRole.SAMPLESTACK_CONTRIBUTOR).newPatchBuilder();
		
		Answer answer = new Answer();
		answer.setText(answerText);
		answer.setId("/answers/" + UUID.randomUUID().toString());
		answer.setItemTally(0);
		answer.setComments(new ArrayList<Comment>());
		
		// put ths sparse contributor data on this node
		SparseContributor owner = contributor.asSparseContributor();
		answer.setOwner(owner);

		try {
			DocumentPatchHandle patch = patchBuilder.insertFragment(
					"/node()/node('answers')", Position.LAST_CHILD,
					mapper.writeValueAsString(answer)).build();
			jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).patch(
					documentUri, patch);
		} catch (MarkLogicIOException e) {
			throw new SamplestackIOException(e);
		} catch (JsonProcessingException e) {
			throw new SamplestackIOException(e);
		}
		return get(ClientRole.SAMPLESTACK_CONTRIBUTOR, idFromUri(documentUri));
	}

	@Override
	/**
	 * Use DocumentPatchBuilder to accept an answer.
	 * Involves updating /acceptedAnswerId and the accepted flag of given answer.
	 */
	public QnADocument accept(String answerId) {
		// TODO optimize - remove this database call (or use for etag)
		// perhaps v document uri values call...
		QnADocument qnaDocument = getByPostId(answerId);
		
		String qnaDocumentId = qnaDocument.getId();
		
		String documentUri = uriFromId(qnaDocumentId);
		JsonNode previousAnsweredId = qnaDocument.getJson().path("acceptedAnswerId");
		
		logger.debug("Accepting " + answerId + " at documentURI" + documentUri);
		DocumentPatchBuilder patchBuilder = jsonDocumentManager(
				ClientRole.SAMPLESTACK_CONTRIBUTOR).newPatchBuilder();

		ObjectNode acceptNode = mapper.createObjectNode();
		acceptNode.put("acceptedAnswerId", answerId);
		ObjectNode acceptFlagNode = mapper.createObjectNode();
		acceptFlagNode.put("accepted", true);

		Transaction transaction = operations
				.start(ClientRole.SAMPLESTACK_CONTRIBUTOR);

		try {
			patchBuilder
					.replaceInsertFragment("acceptedAnswerId", "/node()",
							Position.LAST_CHILD,
							mapper.writeValueAsString(acceptNode));
			patchBuilder.replaceInsertFragment("accepted", "/node()", Position.LAST_CHILD, acceptFlagNode);
			patchBuilder.addPermission("samplestack-guest", Capability.READ);
			DocumentPatchHandle patch = patchBuilder.build();
			logger.debug(patch.toString());
			jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).patch(
					documentUri, patch, transaction);
		} catch (MarkLogicIOException e) {
			throw new SamplestackIOException(e);
		} catch (JsonProcessingException e) {
			throw new SamplestackIOException(e);
		}
		

		// reputation handling
		ArrayNode answers = (ArrayNode) qnaDocument.getJson().get("answers");
		Iterator<JsonNode> iterator = answers.iterator();
		boolean done = false;
		while (iterator.hasNext() || done) {
			JsonNode answer = iterator.next();
			if (! previousAnsweredId.isMissingNode() 
					&& answer.get("id").asText().equals(previousAnsweredId)) {
				String toLowerReputationUserName = answer.get("owner").get("userName").asText();
				Contributor toLowerReputation = contributorService.getByUserName(toLowerReputationUserName);
				toLowerReputation.setReputation(toLowerReputation.getReputation() - 1);
				contributorService.store(toLowerReputation, transaction);
			}
			if (answer.get("id").asText().equals(answerId)) {
				String toRaiseReputationUserName = answer.get("owner").get("userName").asText();
				Contributor toLowerReputation = contributorService.getByUserName(toRaiseReputationUserName);
				toLowerReputation.setReputation(toLowerReputation.getReputation() + 1);
				contributorService.store(toLowerReputation, transaction);
		
			}
		}
		

		transaction.commit();
		QnADocument acceptedDocument = getByPostId(answerId);
		
		return acceptedDocument;
	}

	@Override
	// TODO implement cache
	public QnADocument get(ClientRole role, String id) {
		logger.debug(id);
		JsonNode json = operations.getJsonDocument(role, uriFromId(id));
		QnADocument question = new QnADocument((ObjectNode) json);
		return question;
	}

	private QnADocument getByPostId(String answerId) {
		return findOne(ClientRole.SAMPLESTACK_CONTRIBUTOR, "id:" + answerId, 1);
	}

	@Override
	public ObjectNode rawSearch(ClientRole role, JsonNode structuredQuery,
			long start) {
		return operations
				.qnaSearch(role, structuredQuery, start, QueryView.ALL);
	}

	@Override
	public QnADocument voteUp(Contributor voter, String postId) {
		vote(voter, postId, 1);
		return getByPostId(postId);
	}

	private void vote(Contributor voter, String postId, int delta) {
		if (voter.hasVotedOn(postId)) {
			throw new SampleStackDataIntegrityException(
					"Contributor cannot vote on the same post twice");
		}
		QnADocument qnaDocument = getByPostId(postId);
		String qnaDocumentId = qnaDocument.getId();
		String documentUri = uriFromId(qnaDocumentId);
		
		Transaction transaction = operations
				.start(ClientRole.SAMPLESTACK_CONTRIBUTOR);

		try {
			logger.debug("Voting on " + postId + " at documentURI" + documentUri);
			DocumentPatchBuilder patchBuilder = jsonDocumentManager(
					ClientRole.SAMPLESTACK_CONTRIBUTOR).newPatchBuilder();
			
			try {
				Call call = patchBuilder.call().add(delta);
				patchBuilder.replaceApply("/node()/docScore", call);
		
				patchBuilder.replaceApply("//object-node()[id=\""+postId+"\"]/itemTally", call);
				DocumentPatchHandle patch = patchBuilder.build();

				logger.debug(patch.toString());
				jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).patch(
						documentUri, patch, transaction);
			} catch (MarkLogicIOException e) {
				throw new SamplestackIOException(e);
			}

			// update the contributor record with vote
			voter.getVotes().add(postId);
			voter.setReputation(voter.getReputation() + delta);
			contributorService.store(voter, transaction);

			transaction.commit();
		} catch (SampleStackDataIntegrityException ex) {
			transaction.rollback();
			throw ex;
		}
	}

	@Override
	public QnADocument voteDown(Contributor voter, String postId) {
		vote(voter, postId, -1);
		return getByPostId(postId);
	}

	@Override
	public void delete(String id) {
		jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).delete(
				uriFromId(id));
	}

	@Override
	public QnADocument comment(Contributor contributor, String postId, String text) {
		
		// TODO speed up with values call
		QnADocument qnaDocument = getByPostId(postId);
		String qnaDocumentId = qnaDocument.getId();
		String documentUri = uriFromId(qnaDocumentId);

		
		Comment comment = new Comment();
		comment.setText(text);
		comment.setCreationDate(new Date());
		comment.setOwner(contributor.asSparseContributor());
		
		logger.debug("Commenting on " + postId + " at documentURI" + documentUri);
		DocumentPatchBuilder patchBuilder = jsonDocumentManager(
				ClientRole.SAMPLESTACK_CONTRIBUTOR).newPatchBuilder();

		try {
			patchBuilder
					.insertFragment("//object-node()[id=\""+postId+"\"]/array-node('comments')",
							Position.LAST_CHILD,
							mapper.writeValueAsString(comment));
			DocumentPatchHandle patch = patchBuilder.build();
			logger.debug(patch.toString());
			jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).patch(
					documentUri, patch);
		} catch (MarkLogicIOException e) {
			throw new SamplestackIOException(e);
		} catch (JsonProcessingException e) {
			throw new SamplestackIOException(e);
		}
		return getByPostId(postId);
		
	}

	@Override
	public void deleteAll() {
		operations.deleteDirectory(ClientRole.SAMPLESTACK_CONTRIBUTOR,
				SamplestackType.QUESTIONS);
	}

}
