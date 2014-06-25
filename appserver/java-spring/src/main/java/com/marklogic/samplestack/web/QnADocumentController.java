package com.marklogic.samplestack.web;

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
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.domain.QnADocumentResults;
import com.marklogic.samplestack.domain.SparseQuestion;
import com.marklogic.samplestack.exception.SamplestackAcceptException;
import com.marklogic.samplestack.service.ContributorService;
import com.marklogic.samplestack.service.QnAService;

@RestController
public class QnADocumentController {

	private final Logger logger = LoggerFactory
			.getLogger(QnADocumentController.class);

	@Autowired
	private QnAService qnaService;

	@Autowired
	ObjectMapper mapper;

	@Autowired
	private ContributorService contributorService;

	@RequestMapping(value = "questions", method = RequestMethod.GET)
	public @ResponseBody
	QnADocumentResults getQnADocuments(@RequestParam(required = false) String q,
			@RequestParam(required = false, defaultValue = "1") long start) {
		if (q == null) {
			q = "sort:active";
		}
		return qnaService.search(ClientRole.securityContextRole(), q, start);
	}

	@RequestMapping(value = "questions", method = RequestMethod.POST)
	public @ResponseBody
	@PreAuthorize("hasRole('ROLE_CONTRIBUTORS')")
	@ResponseStatus(HttpStatus.CREATED)
	JsonNode ask(@RequestBody SparseQuestion sparseQuestion) {
		// TODO validate SparseQuestion
		QnADocument qnaDoc = new QnADocument(mapper, sparseQuestion.getTitle(),
				sparseQuestion.getText(), sparseQuestion.getTags());
		QnADocument answered = qnaService.ask(
				ClientRole.securityContextUserName(), qnaDoc);
		return answered.getJson();
	}

	@RequestMapping(value = "questions/{id}", method = RequestMethod.GET)
	public @ResponseBody
	JsonNode get(@PathVariable(value = "id") String id) {
		QnADocument qnaDoc = qnaService.get(ClientRole.securityContextRole(),
				id);
		return qnaDoc.getJson();
	}

	@RequestMapping(value = "questions/{id}", method = RequestMethod.DELETE)
	public @ResponseBody
	@PreAuthorize("hasRole('ROLE_ADMINS')")
	ResponseEntity<?> delete(@PathVariable(value = "id") String id) {
		qnaService.delete("/foo/" + id);
		return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
	}

	@RequestMapping(value = "questions/{id}/answers", method = RequestMethod.POST)
	public @ResponseBody
	@ResponseStatus(HttpStatus.CREATED)
	JsonNode answer(@RequestBody JsonNode answer,
			@PathVariable(value = "id") String id) {
		//validate TODO
		String docUri = "/questions/" + id + ".json";
		QnADocument answered = qnaService.answer(
				ClientRole.securityContextUserName(), docUri, answer.get("text").asText());
		return answered.getJson();
	}
	
	@RequestMapping(value = "questions/{id}/answers/{answerId}/accept", method = RequestMethod.POST)
	public @ResponseBody
	JsonNode accept(@RequestBody JsonNode answer,
			@PathVariable(value = "answerId") String answerIdPart) {
		//validate TODO
		String userName = ClientRole.securityContextUserName();
		String answerId = "/answers/" + answerIdPart;
		QnADocument toAccept = qnaService.search(ClientRole.SAMPLESTACK_CONTRIBUTOR, "id:"+answerId, 1).get(0);
		if (toAccept.getOwnerUserName().equals(userName)) {
			QnADocument accepted = qnaService.accept(answerId);
			return accepted.getJson();			
		}
		else {
			throw new SamplestackAcceptException("Current user does not match owner of question");
		}
	}
	
	@RequestMapping(value = "questions/{id}/comments", method = RequestMethod.POST)
	@ResponseStatus(HttpStatus.CREATED)
	public @ResponseBody
	JsonNode comment(@RequestBody JsonNode comment,
			@PathVariable(value = "id") String questionId) {
		String postId = "/questions/" + questionId + ".json";
		QnADocument toAccept = qnaService.comment(ClientRole.securityContextUserName(), postId, comment.get("text").asText());
		return toAccept.getJson();
	}
	
	@RequestMapping(value = "questions/{id}/answers/{answerId}/comments", method = RequestMethod.POST)
	@ResponseStatus(HttpStatus.CREATED)
	public @ResponseBody
	JsonNode commentAnswer(@RequestBody JsonNode comment,
			@PathVariable(value = "answerId") String answerIdPart) {
		String answerId = "/answers/" + answerIdPart;
		QnADocument toAccept = qnaService.comment(ClientRole.securityContextUserName(), answerId, comment.get("text").asText());
		return toAccept.getJson();
	}
	
	@RequestMapping(value = "search", method = RequestMethod.POST)
	public @ResponseBody
	JsonNode search(@RequestBody JsonNode structuredQuery,
			@RequestParam(defaultValue = "1", required = false) long start) {
		return qnaService.rawSearch(ClientRole.securityContextRole(), structuredQuery, start);
	}
	
}
