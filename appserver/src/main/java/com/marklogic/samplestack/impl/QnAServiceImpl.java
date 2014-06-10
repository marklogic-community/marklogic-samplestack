package com.marklogic.samplestack.impl;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.MarkLogicIOException;
import com.marklogic.client.document.DocumentPatchBuilder;
import com.marklogic.client.document.DocumentPatchBuilder.Position;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.extra.jackson.JacksonHandle;
import com.marklogic.client.io.SearchHandle;
import com.marklogic.client.io.marker.DocumentPatchHandle;
import com.marklogic.client.query.MatchDocumentSummary;
import com.marklogic.client.query.RawStructuredQueryDefinition;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.domain.QnADocumentResults;
import com.marklogic.samplestack.exception.SampleStackException;
import com.marklogic.samplestack.exception.SampleStackIOException;
import com.marklogic.samplestack.service.QnAService;

@Component
public class QnAServiceImpl extends AbstractMarkLogicDataService implements QnAService {

	private final Logger logger = LoggerFactory
			.getLogger(QnAServiceImpl.class);
	
	private static String DIRNAME = "/qna/";
	
	private static String idFromUri(String uri) {
		return uri.replace(DIRNAME, "").replace(".json", "");
	}
	private static String uriFromId(String id) {
		return DIRNAME + id + ".json";
	}
	
	@Override
	public QnADocumentResults search(ClientRole role, String question) {
		QnADocumentResults results = new QnADocumentResults(operations.searchDirectory(role, "/qna/", question));
		//simulate bulk:
		List<QnADocument> sidecar = new ArrayList<QnADocument>();
		for (MatchDocumentSummary summary : results.getResults().getMatchResults()) {
				String docUri = summary.getUri();
				sidecar.add(new QnADocument((ObjectNode) operations.getJsonDocument(role, docUri)));
			}
		results.setSidecar(sidecar);
		return results;
	}

	@Override
	public QnADocument ask(Contributor user, QnADocument question) {
		String documentUri = generateUri(DIRNAME);
		question.setId(documentUri);
		ServerTransform askTransform = new ServerTransform("ask");
		askTransform.put("userName", user.getUserName());
		jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR)
					.write(documentUri, 
						new JacksonHandle(question.getJson()),
						askTransform);
								
		return new QnADocument((ObjectNode) operations.getJsonDocument(ClientRole.SAMPLESTACK_CONTRIBUTOR, documentUri));
	}

	@Override
	public QnADocument answer(Contributor user,
			String toAnswer, String answer) {
		DocumentPatchBuilder patchBuilder = jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).newPatchBuilder();
		ObjectNode json = mapper.createObjectNode();
		json.put("body", answer);
		try {
			DocumentPatchHandle patch = patchBuilder
					.insertFragment("/answers", 
							Position.LAST_CHILD, 
							mapper.writeValueAsString(json)).build();
			jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).patch(toAnswer, patch);
		} catch (MarkLogicIOException e) {
			throw new SampleStackIOException(e);
		} catch (JsonProcessingException e) {
			throw new SampleStackException(e);
		}
		return null;
	}

	@Override
	public void accept(Contributor contributor, String answerId) {
		//PatchBuilder
	}

	@Override
	public QnADocument get(ClientRole role, String id) {
		logger.debug(id);
		JsonNode json = operations.getJsonDocument(role, uriFromId(id));
		QnADocument question = new QnADocument((ObjectNode) json);
		return question;
	}
	
	@Override
	public QnADocumentResults search(ClientRole role,
			RawStructuredQueryDefinition structuredQuery) {
		SearchHandle results = operations.search(role, structuredQuery);
		return new QnADocumentResults(results);
	}
	
	@Override
	public void voteUp(Contributor user, String postUri) {
		
	}
	@Override
	public void voteDown(Contributor user, String postUri) {
		
	}
	@Override
	public void delete(String id) {
		jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).delete(uriFromId(id));
	}

}
