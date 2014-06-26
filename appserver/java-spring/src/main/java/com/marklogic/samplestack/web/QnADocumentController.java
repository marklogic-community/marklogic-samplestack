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
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.domain.SparseQuestion;
import com.marklogic.samplestack.exception.SampleStackDataIntegrityException;
import com.marklogic.samplestack.service.ContributorService;
import com.marklogic.samplestack.service.QnAService;

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

	@RequestMapping(value = "questions", method = RequestMethod.GET)
	public @ResponseBody
	JsonNode getQnADocuments(@RequestParam(required = false) String q,
			@RequestParam(required = false, defaultValue = "1") long start) {
		if (q == null) {
			q = "sort:active";
		}
		ObjectNode structuredQuery = mapper.createObjectNode();
		ObjectNode qtext = mapper.createObjectNode();
		qtext.put("qtext",q);
		structuredQuery.put("query", qtext);
		return qnaService.rawSearch(ClientRole.securityContextRole(), structuredQuery, start);
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
		QnADocument qnaDoc = qnaService.get(ClientRole.securityContextRole(), id);
		return qnaDoc.getJson();
	}

	@RequestMapping(value = "questions/{id}", method = RequestMethod.DELETE)
	public @ResponseBody
	@PreAuthorize("hasRole('ROLE_ADMINS')")
	ResponseEntity<?> delete(@PathVariable(value = "id") String id) {
		qnaService.delete("/questions/" + id);
		return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
	}

	@RequestMapping(value = "questions/{id}/answers", method = RequestMethod.POST)
	public @ResponseBody
	@ResponseStatus(HttpStatus.CREATED)
	JsonNode answer(@RequestBody JsonNode answer,
			@PathVariable(value = "id") String id) {
		//validate TODO
		String answerId = "/questions/" + id;
		QnADocument answered = qnaService.answer(
				ClientRole.securityContextUserName(), answerId, answer.get("text").asText());
		return answered.getJson();
	}
	
	@RequestMapping(value = "questions/{id}/answers/{answerId}/accept", method = RequestMethod.POST)
	public @ResponseBody
	JsonNode accept(@RequestBody JsonNode answer,
			@PathVariable(value = "answerId") String answerIdPart) {
		//validate TODO
		String userName = ClientRole.securityContextUserName();
		String answerId = "/answers/" + answerIdPart;
		QnADocument toAccept = qnaService.findOne(ClientRole.SAMPLESTACK_CONTRIBUTOR, "id:"+answerId, 1);
		if (toAccept.getOwnerUserName().equals(userName)) {
			QnADocument accepted = qnaService.accept(answerId);
			return accepted.getJson();			
		}
		else {
			throw new SampleStackDataIntegrityException("Current user does not match owner of question");
		}
	}
	
	@RequestMapping(value = "questions/{id}/comments", method = RequestMethod.POST)
	@ResponseStatus(HttpStatus.CREATED)
	public @ResponseBody
	JsonNode comment(@RequestBody JsonNode comment,
			@PathVariable(value = "id") String questionId) {
		String postId = "/questions/" + questionId;
		QnADocument toAccept = qnaService.comment(ClientRole.securityContextUserName(), postId, comment.get("text").asText());
		return toAccept.getJson();
	}
	
	@RequestMapping(value = "questions/{id}/upvotes", method = RequestMethod.POST)
	@ResponseStatus(HttpStatus.CREATED)
	public @ResponseBody
	JsonNode voteUp(@RequestBody JsonNode comment,
			@PathVariable(value = "id") String questionId) {
		String postId = "/questions/" + questionId;
		QnADocument toAccept = qnaService.voteUp(ClientRole.securityContextUserName(), postId);
		return toAccept.getJson();
	}
	
	@RequestMapping(value = "questions/{id}/downvotes", method = RequestMethod.POST)
	@ResponseStatus(HttpStatus.CREATED)
	public @ResponseBody
	JsonNode voteDown(@RequestBody JsonNode comment,
			@PathVariable(value = "id") String questionId) {
		String postId = "/questions/" + questionId;
		QnADocument toAccept = qnaService.voteDown(ClientRole.securityContextUserName(), postId);
		return toAccept.getJson();
	}
	
	@RequestMapping(value = "questions/{id}/answers/{answerId}/upvotes", method = RequestMethod.POST)
	@ResponseStatus(HttpStatus.CREATED)
	public @ResponseBody
	JsonNode upVoteAnswer(@RequestBody JsonNode comment,
			@PathVariable(value = "answerId") String answerIdPart) {
		String answerId = "/answers/" + answerIdPart;
		QnADocument toAccept = qnaService.voteUp(ClientRole.securityContextUserName(), answerId);
		return toAccept.getJson();
	}
	
	@RequestMapping(value = "questions/{id}/answers/{answerId}/downvotes", method = RequestMethod.POST)
	@ResponseStatus(HttpStatus.CREATED)
	public @ResponseBody
	JsonNode downVoteAnswer(@RequestBody JsonNode comment,
			@PathVariable(value = "answerId") String answerIdPart) {
		String answerId = "/answers/" + answerIdPart;
		QnADocument toAccept = qnaService.voteDown(ClientRole.securityContextUserName(), answerId);
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
