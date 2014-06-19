package com.marklogic.samplestack.impl;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.MarkLogicIOException;
import com.marklogic.client.document.DocumentPatchBuilder;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.SearchHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.MatchDocumentSummary;
import com.marklogic.client.query.RawStructuredQueryDefinition;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.domain.QnADocumentResults;
import com.marklogic.samplestack.exception.SamplestackIOException;
import com.marklogic.samplestack.service.QnAService;

@Component
public class QnAServiceImpl extends AbstractMarkLogicDataService implements QnAService {

	private final Logger logger = LoggerFactory
			.getLogger(QnAServiceImpl.class);
	
	private static String DIR_NAME = "/questions/";
	
	private static String DUMMY_URI = "/nodoc.json";
	
	private static String idFromUri(String uri) {
		return uri.replace(DIR_NAME, "").replace(".json", "");
	}
	private static String uriFromId(String id) {
		return DIR_NAME + id + ".json";
	}
	
	@Override
	public QnADocumentResults search(ClientRole role, String question) {
		QnADocumentResults results = new QnADocumentResults(operations.searchDirectory(role, "/questions/", question));
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
	public QnADocument ask(String userName, QnADocument question) {
		String documentUri = generateUri(DIR_NAME);
		question.setId(documentUri);
		ServerTransform askTransform = new ServerTransform("ask");
		askTransform.put("userName", userName);
		
		jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR)
					.write(documentUri, 
						new JacksonHandle(question.getJson()),
						askTransform);
								
		return new QnADocument((ObjectNode) operations.getJsonDocument(ClientRole.SAMPLESTACK_CONTRIBUTOR, documentUri));
	}

	@Override
	// TODO consider working around patch, consider implementing native patch
	public QnADocument answer(String userName,
			String toAnswer, String answer) {
		DocumentPatchBuilder patchBuilder = jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).newPatchBuilder();
		ObjectNode json = mapper.createObjectNode();
		json.put("text", answer);
		ServerTransform answerPatchTransform = new ServerTransform("answer-patch");
		answerPatchTransform.put("userName", userName);
		try {
//			DocumentPatchHandle patch = patchBuilder
//					.insertFragment("/answers", 
//							Position.LAST_CHILD, 
//							mapper.writeValueAsString(json)).build();
//			jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).patch(toAnswer, patch);
			
			JacksonHandle handle = new JacksonHandle(json);
			jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).write(toAnswer, handle,answerPatchTransform);
		} catch (MarkLogicIOException e) {
			throw new SamplestackIOException(e);
//		} catch (JsonProcessingException e) {
//			throw new SampleStackException(e);
		}
		return get(ClientRole.SAMPLESTACK_CONTRIBUTOR, idFromUri(toAnswer));
	}

	@Override
	public QnADocument accept(String answerId) {
		ServerTransform acceptPatchTransform = new ServerTransform("accept-patch");
		acceptPatchTransform.put("answerId",  answerId);
		
		// TODO PatchBuilder
		jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).write(DUMMY_URI, new StringHandle(""), acceptPatchTransform);
		//NOTE document URI is thrown away in this workaround method
		
		return getByPostId(answerId);
	}

	@Override
	//TODO implement cache
	public QnADocument get(ClientRole role, String id) {
		logger.debug(id);
		JsonNode json = operations.getJsonDocument(role, uriFromId(id));
		QnADocument question = new QnADocument((ObjectNode) json);
		return question;
	}
	
	private QnADocument getByPostId(String answerId) {
		QnADocumentResults results = search(ClientRole.SAMPLESTACK_CONTRIBUTOR, "id:"+answerId);
		return results.get(0);
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
	@Override
	public QnADocument comment(String userName, String postId, String text) {
		//TODO redo with patch.
		ServerTransform acceptPatchTransform = new ServerTransform("comment-patch");
		acceptPatchTransform.put("postId", postId);
		acceptPatchTransform.put("text", text);
		
		jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).write(DUMMY_URI, new StringHandle(""), acceptPatchTransform);
		//NOTE document URI is thrown away in this workaround method
		
		return getByPostId(postId);
	}

}
