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
package com.marklogic.samplestack.dbclient;

import static com.marklogic.samplestack.SamplestackConstants.QUESTIONS_DIRECTORY;
import static com.marklogic.samplestack.SamplestackConstants.QUESTIONS_OPTIONS;
import static com.marklogic.samplestack.SamplestackConstants.SEARCH_RESPONSE_TRANSFORM;
import static com.marklogic.samplestack.SamplestackConstants.SINGLE_QUESTION_OPTIONS;
import static com.marklogic.samplestack.SamplestackConstants.SINGLE_QUESTION_TRANSFORM;
import static com.marklogic.samplestack.security.ClientRole.SAMPLESTACK_CONTRIBUTOR;

import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.UUID;

import javax.annotation.PostConstruct;

import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
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

/**
 * Implementation of the QnAService interface that uses the MarkLogic Java Client API
 * to implement searches and document updates.  In this class you'll find examples
 * of how to use MarkLogic's multistatement transactions, server-side transforms,
 * and modifications to document permissions.
 * 
 * @see <a href="http://docs.marklogic.com/REST/client/transaction-management">REST API /v1/transactions</a>
 * @see <a href="http://docs.marklogic.com/REST/client/transaction-management">REST API /v1/documents</a>
 * @see <a href="http://docs.marklogic.com/REST/client/transaction-management">REST API /v1/search</a>
 * @see <a href="http://docs.marklogic.com/REST/client/transaction-management">REST API /v1/values</a>
 * @see <a href="http://docs.marklogic.com/guide/java/transactions">Java Client API Transactions</a>
 * @see <a href="http://docs.marklogic.com/guide/java/document-operations/">Java Client API Document operations</a>
 * @see <a href="http://docs.marklogic.com/guide/java/searches">Java Client API Searches</a>
 */
@Component
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
	 * This method simply runs a search against MarkLogic so that its
	 * cache warms up while the Java tier is also warming up.
	 * @throws Exception
	 */
	@PostConstruct
	public void warmupSearchCache() throws Exception {
		logger.info("Warming up MarkLogic Search Caches");
		ObjectNode query = (ObjectNode) mapper
				.readValue("{\"search\":{\"qtext\":\"\"}}",
						JsonNode.class);
		try {
			this.rawSearch(SAMPLESTACK_CONTRIBUTOR, query, 1, DateTimeZone.forOffsetHours(1));
		} catch (Exception e) {
			logger.error("Cannot initialize application.  Something is probably wrong with the MarkLogic server.", e);
		}
	}
	
	/**
	 * Start a multistatement transaction.
	 * 
	 * @param role
	 *            Role for owning the transaction
	 * @return A transaction to use in subsequent calls to MarkLogic
	 */
	private Transaction startTransaction(ClientRole role) {
		return clients.get(role).openTransaction();
	}

	@Override
	public QnADocument findOne(ClientRole role, String queryString, long start, String loggedInId) {
		QueryManager queryManager = queryManager(role);
		QueryDefinition stringQuery = queryManager.newStringDefinition(
				SINGLE_QUESTION_OPTIONS).withCriteria(queryString);

		stringQuery.setDirectory(QUESTIONS_DIRECTORY);
		ServerTransform transform = new ServerTransform(SINGLE_QUESTION_TRANSFORM);
		if (loggedInId != null) {
			transform.add("voterId", loggedInId);
		}
		stringQuery.setResponseTransform(transform);

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
		jsonDocumentManager(SAMPLESTACK_CONTRIBUTOR).write(
				documentUri, new JacksonHandle(jsonNode));

		return new QnADocument((ObjectNode) getJsonDocument(
				SAMPLESTACK_CONTRIBUTOR, documentUri));
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
				SAMPLESTACK_CONTRIBUTOR).newPatchBuilder();

		Answer answer = new Answer();
		answer.setText(answerText);
		answer.setId(UUID.randomUUID().toString());
		answer.setItemTally(0);
		answer.setComments(new ArrayList<Comment>());
		answer.setCreationDate(new Date());
		answer.setUpvotingContributorIds(new String[] {});
		answer.setDownvotingContributorIds(new String[] {});

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
			jsonDocumentManager(SAMPLESTACK_CONTRIBUTOR).patch(
					documentUri, patch);
		} catch (MarkLogicIOException e) {
			throw new SamplestackIOException(e);
		} catch (JsonProcessingException e) {
			throw new SamplestackIOException(e);
		}
		return get(SAMPLESTACK_CONTRIBUTOR, contributor, idFromUri(documentUri));
	}

	@Override
	/**
	 * Use DocumentPatchBuilder to accept an answer.
	 * Involves updating /acceptedAnswerId and the accepted flag of given answer.
	 */
	public QnADocument accept(Contributor contributor, String answerId) {
		QnADocument qnaDocument = getByPostId(SAMPLESTACK_CONTRIBUTOR, contributor, answerId);

		String qnaDocumentId = qnaDocument.getId();

		String documentUri = uriFromId(qnaDocumentId);
		JsonNode previousAnsweredId = qnaDocument.getJson().path(
				"acceptedAnswerId");

		logger.debug("Accepting " + answerId + " at documentURI" + documentUri);
		DocumentPatchBuilder patchBuilder = jsonDocumentManager(
				SAMPLESTACK_CONTRIBUTOR).newPatchBuilder();

		Transaction transaction = startTransaction(SAMPLESTACK_CONTRIBUTOR);

		try {
			patchBuilder.replaceValue("/acceptedAnswerId", answerId);
			patchBuilder.replaceValue("/lastActivityDate",
					ISO8601Formatter.format(new Date()));
			patchBuilder.replaceFragment("/accepted", true);
			patchBuilder.addPermission("samplestack-guest", Capability.READ);
			DocumentPatchHandle patch = patchBuilder.build();
			logger.debug(patch.toString());
			jsonDocumentManager(SAMPLESTACK_CONTRIBUTOR).patch(
					documentUri, patch, transaction);

			// reputation handling
			ArrayNode answers = (ArrayNode) qnaDocument.getJson()
					.get("answers");
			Iterator<JsonNode> iterator = answers.iterator();
			while (iterator.hasNext()) {
				JsonNode answer = iterator.next();
				String id = answer.get("id").asText();
				if (!previousAnsweredId.isMissingNode()
						&& id.equals(previousAnsweredId.asText())) {
					adjustReputation(answer.get("owner"), -1, transaction);
				}
				if (answer.get("id").asText().equals(answerId)) {
					adjustReputation(answer.get("owner"), 1, transaction);
				}
			}

			transaction.commit();
			transaction = null;
			QnADocument acceptedDocument = getByPostId(SAMPLESTACK_CONTRIBUTOR, contributor, answerId);

			return acceptedDocument;
		} finally {
			if (transaction != null) { transaction.rollback(); };
		}
	}

	@Override
	public QnADocument get(ClientRole role, Contributor contributor, String id) {
		return getByPostId(role, contributor, id);
	}

	private QnADocument getByPostId(ClientRole role, Contributor loggedInUser, String postId) {
		String loggedInId = null;
		if (loggedInUser != null) {
			loggedInId = loggedInUser.getId();
		}
		return findOne(role, "id:" + postId, 1, loggedInId);
	}

	private DateTime[] getDateRanges(ClientRole role, ObjectNode structuredQuery, DateTimeZone userTimeZone) {
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
			responseHandle = queryManager.values(valdef, new ValuesHandle());
		} catch (com.marklogic.client.FailedRequestException ex) {
			throw new SamplestackSearchException(ex);
		}
		String minDate = responseHandle.getAggregates()[0].getValue();
		String maxDate = responseHandle.getAggregates()[1].getValue();
		if (!minDate.equals("")) {
			dates[0] = new DateTime(minDate, userTimeZone);
		}
		if (!maxDate.equals("")) {
			dates[1] = new DateTime(maxDate, userTimeZone);
		}
		return dates;
	}

	@Override
	public ObjectNode rawSearch(ClientRole role, ObjectNode structuredQuery,
			long start, DateTimeZone userTimeZone) {
		ObjectNode docNode = mapper.createObjectNode();
		ObjectNode searchNode = docNode.putObject("search");
		if (structuredQuery != null) {
			if (structuredQuery.get("search") != null) {
				searchNode.setAll((ObjectNode) structuredQuery.get("search"));
			}
		}
		String period = "";
		if (userTimeZone != null) {
			ObjectNode options = searchNode.putObject("options");
			options.put("page-length", SamplestackConstants.RESULTS_PAGE_LENGTH);

			DateTime[] dateRange = getDateRanges(role, structuredQuery, userTimeZone);

			if (dateRange[0] != null && dateRange[1] != null) {
				ObjectNode facetDescriptor = DateFacetBuilder.dateFacet(
						dateRange[0], dateRange[1]);
				period = facetDescriptor.get("period").asText();
				facetDescriptor.remove("period");
				options.setAll(facetDescriptor);
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

		while (docPage.hasNext()) {
			// the matching document, as returned by extract-document-data
			// specification
			ObjectNode documentResultObject = (ObjectNode) docPage.nextContent(
					new JacksonHandle()).get();

			ObjectNode searchResponseResultNode = (ObjectNode) results
					.get(objectIndex);

			// TODO this all should be extractable server-side, but
			// I ran into issues with extract-document-data (10/15/2015)
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

			newContent.set("owner", documentResultObject.get("owner"));

			// remove unused keys
			searchResponseResultNode.remove("matches");
			searchResponseResultNode.remove("metadata");

			objectIndex++;
		}

		// find the date facet and decorate with period
		ObjectNode facetsNode = (ObjectNode) responseNode.get("facets");
		try {
			((ObjectNode) facetsNode.get("date")).put("period", period);
		} catch (Exception e) {
			// do nothing with facets if we couldn't add the period.
			logger.debug("Unable to decorate facet payload with Period " + period);
		}
		responseNode.set("facets", facetsNode);
		return (ObjectNode) responseNode;
	}

	@Override
	// TODO date facet is default ON now. open issue is to control state from
	// browser.
	public ObjectNode rawSearch(ClientRole role, ObjectNode query, long start) {
		return rawSearch(role, query, start, null);
	}

	@Override
	public QnADocument voteUp(Contributor voter, String postId) {
		vote(voter, postId, 1, "upvotingContributorIds");
		return getByPostId(SAMPLESTACK_CONTRIBUTOR, voter, postId);
	}

	private void vote(Contributor voter, String postId, int delta, String trackingArrayKeyName) {
		Transaction transaction = startTransaction(SAMPLESTACK_CONTRIBUTOR);
		QnADocument qnaDocument = getByPostId(SAMPLESTACK_CONTRIBUTOR, voter, postId);
		String voterId = voter.getId();
		String qnaDocumentId = qnaDocument.getId();
		String documentUri = uriFromId(qnaDocumentId);
		
		logger.debug("IN VOTES.  voter is "+ voter.getUserName() +". Voter votecount is " + voter.getVoteCount());

		try {
			// is this vote on a root question?
			String tallyPath = null;
			String trackingArrayPath = null;
			if (postId.equals(qnaDocumentId)) {
				tallyPath = "/itemTally";
				trackingArrayPath = "/array-node(\"" + trackingArrayKeyName
						+ "\")";
				// hasVoted?
				ArrayNode existingUpVotes = (ArrayNode) qnaDocument.getJson()
						.get("upvotingContributorIds");
				for (JsonNode n : existingUpVotes) {
					if (n.asText().equals(voterId)) {
						throw new SampleStackDataIntegrityException(
								"Contributor cannot vote on the same post twice");
					}
				}
				ArrayNode existingDownVotes = (ArrayNode) qnaDocument.getJson()
						.get("downvotingContributorIds");
				for (JsonNode n : existingDownVotes) {
					if (n.asText().equals(voterId)) {
						throw new SampleStackDataIntegrityException(
								"Contributor cannot vote on the same post twice");
					}
				}
			} // or on an answer
			else {
				tallyPath = "/answers[id=\"" + postId + "\"]/itemTally";
				trackingArrayPath = "/answers[id=\"" + postId
						+ "\"]/array-node(\"" + trackingArrayKeyName + "\")";
				ArrayNode answers = (ArrayNode) qnaDocument.getJson().get(
						"answers");
				for (JsonNode answer : answers) {
					if (answer.get("id").asText().equals(postId)) {
						ArrayNode existingVotes = (ArrayNode) answer
								.get(trackingArrayKeyName);
						for (JsonNode n : existingVotes) {
							if (n.asText().equals(voterId)) {
								throw new SampleStackDataIntegrityException(
										"Contributor cannot vote on the same post twice");
							}
						}
						break;
					}
				}
			}
			logger.debug("Voting on " + postId + " at documentURI"
					+ documentUri);
			DocumentPatchBuilder patchBuilder = jsonDocumentManager(
					SAMPLESTACK_CONTRIBUTOR).newPatchBuilder();

			try {
				Call call = patchBuilder.call().add(delta);
				patchBuilder.replaceApply("/voteCount", call);

				patchBuilder.replaceApply(tallyPath, call);

				patchBuilder.insertFragment(trackingArrayPath, Position.LAST_CHILD, new TextNode(voterId));
				DocumentPatchHandle patch = patchBuilder.build();

				logger.debug(patch.toString());
				jsonDocumentManager(SAMPLESTACK_CONTRIBUTOR).patch(
						documentUri, patch, transaction);
			} catch (MarkLogicIOException e) {
				throw new SamplestackIOException(e);
			}

			// update the contributor record with vote
			Contributor toUpdateVoter = contributorService.read(voterId, transaction);
			toUpdateVoter.setVoteCount(toUpdateVoter.getVoteCount() + 1);
			contributorService.store(toUpdateVoter, transaction);

			if (qnaDocument.getJson().get("id").asText().equals(postId)) {
				adjustReputation(qnaDocument.getJson().get("owner"), delta, transaction);
			}
			else {
				Iterator<JsonNode> iterator = qnaDocument.getJson().get("answers").iterator();
				while (iterator.hasNext()) {
					ObjectNode answer = (ObjectNode) iterator.next();
					if (answer.get("id").asText().equals(postId)) {
						adjustReputation(answer.get("owner"), delta, transaction);
						break;
					}
				}
			}

			transaction.commit();
			transaction = null;
		}
		finally {
			if (transaction != null) {
				transaction.rollback();
			}
		}
	}

	private void adjustReputation(JsonNode ownerNode, int delta,
			Transaction transaction) {
		if (ownerNode.isObject()) {
			String toAdjustId = ownerNode.get("id").asText();

			Contributor toAdjustObject = contributorService
					.read(toAdjustId, transaction);
			if (toAdjustObject != null) {
				toAdjustObject.setReputation(
						toAdjustObject.getReputation() + delta);
			contributorService
					.store(toAdjustObject, transaction);
			}
		} else {
			logger.warn("Could not adjust repuation of owner, ignoring");
		}
	}

	@Override
	public QnADocument voteDown(Contributor voter, String postId) {
		vote(voter, postId, -1, "downvotingContributorIds");
		return getByPostId(SAMPLESTACK_CONTRIBUTOR, voter, postId);
	}

	@Override
	public void delete(String id) {
		jsonDocumentManager(SAMPLESTACK_CONTRIBUTOR).delete(
				uriFromId(id));
	}

	@Override
	public QnADocument comment(Contributor contributor, String postId,
			String text) {

		// TODO speed up with values call
		QnADocument qnaDocument = getByPostId(SAMPLESTACK_CONTRIBUTOR, contributor, postId);
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
				SAMPLESTACK_CONTRIBUTOR).newPatchBuilder();

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
			DocumentPatchHandle patch = patchBuilder.build();
			logger.debug(patch.toString());
			jsonDocumentManager(SAMPLESTACK_CONTRIBUTOR).patch(
					documentUri, patch);
		} catch (MarkLogicIOException e) {
			throw new SamplestackIOException(e);
		} catch (JsonProcessingException e) {
			throw new SamplestackIOException(e);
		}
		return getByPostId(SAMPLESTACK_CONTRIBUTOR, contributor, postId);

	}

	@Override
	public void deleteAll() {
		deleteDirectory(SAMPLESTACK_CONTRIBUTOR, QUESTIONS_DIRECTORY);
	}

}
