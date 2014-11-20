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
package com.marklogic.samplestack.dbclient;

import static com.marklogic.samplestack.SamplestackConstants.QUESTIONS_DIRECTORY;
import static com.marklogic.samplestack.SamplestackConstants.QUESTIONS_OPTIONS;
import static com.marklogic.samplestack.SamplestackConstants.SEARCH_RESPONSE_TRANSFORM;
import static com.marklogic.samplestack.SamplestackConstants.SINGLE_QUESTION_OPTIONS;

import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.UUID;

import org.joda.time.DateTime;
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
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.DocumentMetadataHandle.Capability;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.ValuesHandle;
import com.marklogic.client.io.marker.DocumentPatchHandle;
import com.marklogic.client.query.QueryDefinition;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.QueryManager.QueryView;
import com.marklogic.client.query.RawCombinedQueryDefinition;
import com.marklogic.client.query.RawQueryDefinition;
import com.marklogic.client.query.ValuesDefinition;
import com.marklogic.samplestack.SamplestackConstants;
import com.marklogic.samplestack.SamplestackConstants.ISO8601Formatter;
import com.marklogic.samplestack.domain.Answer;
import com.marklogic.samplestack.domain.Comment;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.InitialQuestion;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.domain.SparseContributor;
import com.marklogic.samplestack.exception.SampleStackDataIntegrityException;
import com.marklogic.samplestack.exception.SamplestackIOException;
import com.marklogic.samplestack.exception.SamplestackNotFoundException;
import com.marklogic.samplestack.exception.SamplestackSearchException;
import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.service.ContributorService;
import com.marklogic.samplestack.service.QnAService;

@Component
/**
 * Implementation of the QnAService interface.
 */
public class MarkLogicQnAService extends MarkLogicBaseService implements
		QnAService {

	@Autowired
	private ContributorService contributorService;

	private final Logger logger = LoggerFactory
			.getLogger(MarkLogicQnAService.class);

	private static String idFromUri(String uri) {
		return uri.replace("/questions/", "").replace(".json", "");
	}

	private static String uriFromId(String id) {
		return "/questions/" + id + ".json";
	}

	private String generateUri() {

		return QUESTIONS_DIRECTORY + UUID.randomUUID() + ".json";

	}

	/**
	 * Start a transaction
	 * 
	 * @param role
	 *            Role to search with
	 * @return A transaction to use in subsequent calls to MarkLogic
	 */
	private Transaction startTransaction(ClientRole role) {
		return clients.get(role).openTransaction();
	}

	@Override
	public QnADocument findOne(ClientRole role, String queryString, long start) {
		QueryManager queryManager = queryManager(role);
		QueryDefinition stringQuery = queryManager.newStringDefinition(
				SINGLE_QUESTION_OPTIONS).withCriteria(queryString);

		stringQuery.setDirectory(QUESTIONS_DIRECTORY);
		DocumentPage page = jsonDocumentManager(role)
				.search(stringQuery, start);
		if (page.hasNext()) {
			JacksonHandle handle = new JacksonHandle();
			handle = page.nextContent(handle);
			QnADocument newDocument = new QnADocument((ObjectNode) handle.get());
			return newDocument;
		} else {
			return null;
		}
	}

	@Override
	public QnADocument ask(Contributor user, InitialQuestion question) {
		String documentUri = generateUri();
		question.setId(idFromUri(documentUri));

		Date now = new Date();
		question.setCreationDate(now);
		question.updateLastActivityDate();
		question.setAcceptedAnswerId(null);
		question.setOwner(user.asSparseContributor());
		question.setComments(new Comment[0]);
		question.setAnswers(new Answer[0]);
		question.setAnswerCount(0);

		JsonNode jsonNode = mapper.convertValue(question, JsonNode.class);
		jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).write(
				documentUri, new JacksonHandle(jsonNode));

		return new QnADocument((ObjectNode) getJsonDocument(
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
	public QnADocument answer(Contributor contributor, String toAnswerId,
			String answerText) {
		String documentUri = uriFromId(toAnswerId);
		DocumentPatchBuilder patchBuilder = jsonDocumentManager(
				ClientRole.SAMPLESTACK_CONTRIBUTOR).newPatchBuilder();

		Answer answer = new Answer();
		answer.setText(answerText);
		answer.setId(UUID.randomUUID().toString());
		answer.setItemTally(0);
		answer.setComments(new ArrayList<Comment>());
		answer.setCreationDate(new Date());

		// put ths sparse contributor data on this node
		SparseContributor owner = contributor.asSparseContributor();
		answer.setOwner(owner);

		try {
			patchBuilder.insertFragment("/node('answers')",
					Position.LAST_CHILD, mapper.writeValueAsString(answer));
			patchBuilder.replaceValue("/lastActivityDate",
					ISO8601Formatter.format(new Date()));
			Call call = patchBuilder.call().add(1);
			patchBuilder.replaceApply("/answerCount", call);
			DocumentPatchHandle patch = patchBuilder.build();
			logger.debug(patch.toString());
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
		QnADocument qnaDocument = getByPostId(answerId);

		String qnaDocumentId = qnaDocument.getId();

		String documentUri = uriFromId(qnaDocumentId);
		JsonNode previousAnsweredId = qnaDocument.getJson().path(
				"acceptedAnswerId");

		logger.debug("Accepting " + answerId + " at documentURI" + documentUri);
		DocumentPatchBuilder patchBuilder = jsonDocumentManager(
				ClientRole.SAMPLESTACK_CONTRIBUTOR).newPatchBuilder();

		Transaction transaction = startTransaction(ClientRole.SAMPLESTACK_CONTRIBUTOR);

		try {
			patchBuilder.replaceValue("/acceptedAnswerId", answerId);
			patchBuilder.replaceValue("/lastActivityDate",
					ISO8601Formatter.format(new Date()));
			patchBuilder.replaceValue("/accepted", true);
			patchBuilder.addPermission("samplestack-guest", Capability.READ);
			DocumentPatchHandle patch = patchBuilder.build();
			logger.debug(patch.toString());
			jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).patch(
					documentUri, patch, transaction);
		} catch (MarkLogicIOException e) {
			throw new SamplestackIOException(e);
		}

		// reputation handling
		ArrayNode answers = (ArrayNode) qnaDocument.getJson().get("answers");
		Iterator<JsonNode> iterator = answers.iterator();
		boolean done = false;
		while (iterator.hasNext() || done) {
			JsonNode answer = iterator.next();
			String id = answer.get("id").asText();
			if (!previousAnsweredId.isMissingNode()
					&& id.equals(previousAnsweredId.asText())) {
				String toLowerReputationUserName = answer.get("owner")
						.get("userName").asText();
				Contributor toLowerReputation = contributorService
						.getByUserName(toLowerReputationUserName);
				toLowerReputation.setReputation(toLowerReputation
						.getReputation() - 1);
				contributorService.store(toLowerReputation, transaction);
			}
			if (answer.get("id").asText().equals(answerId)) {
				String toRaiseReputationUserName = answer.get("owner")
						.get("userName").asText();
				Contributor toRaiseReputation = contributorService
						.getByUserName(toRaiseReputationUserName);
				toRaiseReputation.setReputation(toRaiseReputation
						.getReputation() + 1);
				contributorService.store(toRaiseReputation, transaction);
			}
		}

		transaction.commit();
		QnADocument acceptedDocument = getByPostId(answerId);

		return acceptedDocument;
	}

	@Override
	/** This method gets a document for deliver
	 * to the REST endpoint.  
	 * Since it needs users' reputation as part of the 
	 * payload it invokes s transform to add it.
	 */
	public QnADocument get(ClientRole role, String id) {
		logger.debug("Fetching document with ID " + id);
		ServerTransform transform = new ServerTransform("single-question");
		JacksonHandle handle = new JacksonHandle();
		JacksonHandle jacksonHandle = clients.get(role).newJSONDocumentManager()
				.read(uriFromId(id), null, handle, transform);
		JsonNode json = jacksonHandle.get();
		QnADocument question = new QnADocument((ObjectNode) json);
		return question;
	}

	private QnADocument getByPostId(String answerId) {
		return findOne(ClientRole.SAMPLESTACK_CONTRIBUTOR, "id:" + answerId, 1);
	}

	private DateTime[] getDateRanges(ClientRole role, ObjectNode structuredQuery) {
		DateTime[] dates = new DateTime[2];
		QueryManager queryManager = clients.get(role).newQueryManager();
		ValuesDefinition valdef = queryManager
				.newValuesDefinition("lastActivityDate");
		valdef.setAggregate("min", "max");
		valdef.setView("aggregate");
		JacksonHandle handle = new JacksonHandle();
		handle.set(structuredQuery);
		RawCombinedQueryDefinition qdef = queryManager
				.newRawCombinedQueryDefinition(handle, QUESTIONS_OPTIONS);
		valdef.setQueryDefinition(qdef);
		ValuesHandle responseHandle = null;
		try {
			responseHandle = queryManager.values(valdef,
					new ValuesHandle());
		} catch (com.marklogic.client.FailedRequestException ex) {
			throw new SamplestackSearchException(ex);
		}
		String minDate = responseHandle.getAggregates()[0].getValue();
		String maxDate = responseHandle.getAggregates()[1].getValue();
		if (!minDate.equals("")) {
			dates[0] = new DateTime(minDate);
		}
		if (!maxDate.equals("")) {
			dates[1] = new DateTime(maxDate);
		}
		return dates;
	}

	@Override
	public ObjectNode rawSearch(ClientRole role, ObjectNode structuredQuery,
			long start, ArrayNode qtext, boolean includeDateFacet) {
		ObjectNode docNode = mapper.createObjectNode();
		ObjectNode searchNode = docNode.putObject("search");
		if (structuredQuery != null) {
			searchNode.setAll(structuredQuery);
		}
		if (qtext != null) {
			ArrayNode qtextNode = searchNode.putArray("qtext");
			qtextNode.addAll(qtext);
		}
		if (includeDateFacet) {
			ObjectNode options = searchNode.putObject("options");
			options.put("page-length", SamplestackConstants.RESULTS_PAGE_LENGTH);

			DateTime[] dateRange = getDateRanges(role, structuredQuery);
			logger.debug("Got ranges for buckets: " + dateRange.toString());

			if (dateRange[0] != null && dateRange[1] != null) {
				options.setAll(DateFacetBuilder.dateFacet(dateRange[0],
						dateRange[1]));
				logger.debug("Got date range to query: "
						+ dateRange[0].toString() + " to "
						+ dateRange[1].toString());
			}
		}
		QueryManager queryManager = clients.get(role).newQueryManager();
		JSONDocumentManager docMgr = clients.get(role).newJSONDocumentManager();

		RawQueryDefinition qdef = queryManager.newRawStructuredQueryDefinition(
				new JacksonHandle(docNode), QUESTIONS_OPTIONS);
		ServerTransform responseTransform = new ServerTransform(
				SEARCH_RESPONSE_TRANSFORM);
		qdef.setDirectory(QUESTIONS_DIRECTORY);
		qdef.setResponseTransform(responseTransform);
		queryManager.setView(QueryView.ALL);

		JacksonHandle responseHandle = new JacksonHandle();
		docMgr.setSearchView(QueryView.ALL);
		docMgr.setPageLength(SamplestackConstants.RESULTS_PAGE_LENGTH);

		DocumentPage docPage = null;
		try {
			docPage = docMgr.search(qdef, start, responseHandle);
		} catch (com.marklogic.client.FailedRequestException ex) {
			throw new SamplestackSearchException(ex);
		}
		ObjectNode responseNode = (ObjectNode) responseHandle.get();
		ArrayNode results = (ArrayNode) responseNode.findPath("results");

		int objectIndex = 0;
		JsonNode reputations = responseNode.findPath("reputations");

		while (docPage.hasNext()) {
			// the matching document, as returned by extract-document-data
			// specification
			ObjectNode documentResultObject = (ObjectNode) docPage.nextContent(
					new JacksonHandle()).get();

			ObjectNode searchResponseResultNode = (ObjectNode) results
					.get(objectIndex);

			// TODO this all should be extractable server-side, but
			// I ran into issues with extract-document-data (10/15/2014)
			ObjectNode newContent = searchResponseResultNode
					.putObject("content");
			newContent.put("accepted", documentResultObject.get("accepted")
					.asBoolean());
			newContent.put("creationDate",
					documentResultObject.get("creationDate").asText());
			newContent.put("voteCount", documentResultObject.get("voteCount")
					.asLong());
			newContent.put("answerCount",
					documentResultObject.get("answerCount").asLong());
			ArrayNode snippetNode = newContent.putArray("snippets");
			snippetNode.addAll((ArrayNode) searchResponseResultNode
					.get("matches"));
			ArrayNode tagsNode = newContent.putArray("tags");
			tagsNode.addAll((ArrayNode) documentResultObject.get("tags"));
			newContent.put("lastActivityDate",
					documentResultObject.get("lastActivityDate").asText());
			newContent.put("id", documentResultObject.get("id").asText());
			if (documentResultObject.get("originalId") != null) {
				newContent.put("originalId",
						documentResultObject.get("originalId").asText());
			}
			// newContent.put("answerCount",
			// documentResult.get("answers").size());
			newContent.put("title", documentResultObject.get("title").asText());

			try {
				logger.debug(mapper.writeValueAsString(documentResultObject
						.get("owner")));
			} catch (JsonProcessingException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			newContent.put("owner", documentResultObject.get("owner"));

			// remove unused keys
			searchResponseResultNode.remove("matches");
			searchResponseResultNode.remove("metadata");

			objectIndex++;
		}

		responseNode.remove("reputations");

		return (ObjectNode) responseNode;
	}

	@Override
	// TODO date facet is default ON now. open issue is to control state from
	// browser.
	public ObjectNode rawSearch(ClientRole role, ObjectNode query, long start) {
		return rawSearch(role, query, start, null, false);
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

		Transaction transaction = startTransaction(ClientRole.SAMPLESTACK_CONTRIBUTOR);

		try {
			logger.debug("Voting on " + postId + " at documentURI"
					+ documentUri);
			DocumentPatchBuilder patchBuilder = jsonDocumentManager(
					ClientRole.SAMPLESTACK_CONTRIBUTOR).newPatchBuilder();

			try {
				Call call = patchBuilder.call().add(delta);
				patchBuilder.replaceApply("/voteCount", call);

				if (postId.equals(qnaDocumentId)) {
					patchBuilder.replaceApply("/itemTally", call);
				} else {
					patchBuilder.replaceApply("/answers[id=\"" + postId
							+ "\"]/itemTally", call);
				}
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
	public QnADocument comment(Contributor contributor, String postId,
			String text) {

		// TODO speed up with values call
		QnADocument qnaDocument = getByPostId(postId);
		if (qnaDocument == null) {
			throw new SamplestackNotFoundException();
		}
		String qnaDocumentId = qnaDocument.getId();
		String documentUri = uriFromId(qnaDocumentId);

		Comment comment = new Comment();
		comment.setText(text);
		comment.setCreationDate(new Date());
		comment.setOwner(contributor.asSparseContributor());

		logger.debug("Commenting on " + postId + " at documentURI"
				+ documentUri);
		DocumentPatchBuilder patchBuilder = jsonDocumentManager(
				ClientRole.SAMPLESTACK_CONTRIBUTOR).newPatchBuilder();

		try {
			if (postId.equals(qnaDocumentId)) {
				patchBuilder
						.insertFragment("/array-node('comments')",
								Position.LAST_CHILD,
								mapper.writeValueAsString(comment));
			} else {
				patchBuilder.insertFragment("/answers[id=\"" + postId
						+ "\"]/array-node('comments')", Position.LAST_CHILD,
						mapper.writeValueAsString(comment));
			}
			patchBuilder.replaceValue("/lastActivityDate",
					ISO8601Formatter.format(new Date()));

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
		deleteDirectory(ClientRole.SAMPLESTACK_CONTRIBUTOR, QUESTIONS_DIRECTORY);
	}

}
