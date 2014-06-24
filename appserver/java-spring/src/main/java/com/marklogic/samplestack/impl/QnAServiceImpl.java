package com.marklogic.samplestack.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.MarkLogicIOException;
import com.marklogic.client.Transaction;
import com.marklogic.client.document.DocumentPage;
import com.marklogic.client.document.DocumentPatchBuilder;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.SearchHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryManager.QueryView;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.domain.QnADocumentResults;
import com.marklogic.samplestack.domain.SamplestackType;
import com.marklogic.samplestack.exception.SamplestackIOException;
import com.marklogic.samplestack.service.ContributorService;
import com.marklogic.samplestack.service.QnAService;

@Component
public class QnAServiceImpl extends AbstractMarkLogicDataService implements
		QnAService {

	@Autowired
	private ContributorService contributorService;
	
	private final Logger logger = LoggerFactory.getLogger(QnAServiceImpl.class);

	private static SamplestackType type = SamplestackType.QUESTIONS;

	private static String DUMMY_URI = "/nodoc.json";

	private static String idFromUri(String uri) {
		return uri.replace(".json", "");
	}

	private static String uriFromId(String id) {
		return id + ".json";
	}

	@Override
	public QnADocumentResults search(ClientRole role, String question,
			long start) {
		SearchHandle handle = new SearchHandle();
		DocumentPage page = operations.searchDirectory(role,
				SamplestackType.QUESTIONS, question, start);
		QnADocumentResults results = new QnADocumentResults(handle, page);

		return results;
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
	// TODO consider working around patch, consider implementing native patch
	public QnADocument answer(String userName, String toAnswerId, String answer) {
		String documentUri = uriFromId(toAnswerId);
		DocumentPatchBuilder patchBuilder = jsonDocumentManager(
				ClientRole.SAMPLESTACK_CONTRIBUTOR).newPatchBuilder();
		ObjectNode json = mapper.createObjectNode();
		json.put("text", answer);
		ServerTransform answerPatchTransform = new ServerTransform(
				"answer-patch");
		answerPatchTransform.put("userName", userName);
		try {
			// DocumentPatchHandle patch = patchBuilder
			// .insertFragment("/answers",
			// Position.LAST_CHILD,
			// mapper.writeValueAsString(json)).build();
			// jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).patch(toAnswer,
			// patch);

			JacksonHandle handle = new JacksonHandle(json);
			jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).write(
					documentUri, handle, answerPatchTransform);
		} catch (MarkLogicIOException e) {
			throw new SamplestackIOException(e);
			// } catch (JsonProcessingException e) {
			// throw new SampleStackException(e);
		}
		return get(ClientRole.SAMPLESTACK_CONTRIBUTOR, idFromUri(documentUri));
	}

	@Override
	public QnADocument accept(String answerId) {
		ServerTransform acceptPatchTransform = new ServerTransform(
				"accept-patch");
		acceptPatchTransform.put("answerId", answerId);

		// TODO PatchBuilder
		jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).write(
				DUMMY_URI, new StringHandle(""), acceptPatchTransform);
		// NOTE document URI is thrown away in this workaround method

		return getByPostId(answerId);
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
		QnADocumentResults results = search(ClientRole.SAMPLESTACK_CONTRIBUTOR,
				"id:" + answerId, 1);
		return results.get(0);
	}

	@Override
	public ObjectNode rawSearch(ClientRole role, JsonNode structuredQuery,
			long start) {
		return operations.rawStructuredSearch(role, SamplestackType.QUESTIONS,
				structuredQuery, start, QueryView.ALL);
	}

	@Override
	public QnADocument voteUp(String userName, String postId) {
		vote(userName, postId, 1);
		return getByPostId(postId);
	}

	
	
	private void vote(String userName, String postId, int delta) {
		Contributor contributor = contributorService.getByUserName(userName);
		if (contributor.hasVotedOn(postId)) {
			throw new SampleStackVotingException("Contributor cannot vote on the same post twice");
		}
		
		Transaction transaction = operations.start(ClientRole.SAMPLESTACK_CONTRIBUTOR);
				
		ServerTransform votePatchTransform = new ServerTransform("vote-patch");
		votePatchTransform.put("postId", postId);
		votePatchTransform.put("delta", Integer.toString(delta));
		// TODO PatchBuilder
		jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).write(
				DUMMY_URI, new StringHandle(""), votePatchTransform, transaction);
		
		
		// update the contributor record with vote
		contributor.getVotes().add(postId);
		contributorService.store(contributor, transaction);
		
		transaction.commit();
		
	}

	@Override
	public QnADocument voteDown(String userName, String postId) {
		vote(userName, postId, -1);
		return getByPostId(postId);
	}

	@Override
	public void delete(String id) {
		jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).delete(
				uriFromId(id));
	}

	@Override
	public QnADocument comment(String userName, String postId, String text) {
		// TODO redo with patch.
		ServerTransform acceptPatchTransform = new ServerTransform(
				"comment-patch");
		acceptPatchTransform.put("postId", postId);
		acceptPatchTransform.put("text", text);

		jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).write(
				DUMMY_URI, new StringHandle(""), acceptPatchTransform);
		// NOTE document URI is thrown away in this workaround method

		return getByPostId(postId);
	}

	@Override
	public void deleteAll() {
		operations.deleteDirectory(ClientRole.SAMPLESTACK_CONTRIBUTOR,
				SamplestackType.QUESTIONS);
	}

}
