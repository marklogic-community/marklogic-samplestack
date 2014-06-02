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

import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.domain.QnADocumentResults;
import com.marklogic.samplestack.service.QnAService;

@RestController
public class QnADocumentController {

	private final Logger logger = LoggerFactory.getLogger(QnADocumentController.class);

	@Autowired
	private QnAService qnaService;

	@RequestMapping(value = "questions", method = RequestMethod.GET)
	public @ResponseBody
	QnADocumentResults getQnADocuments(@RequestParam String q) {
		return qnaService.search(q);
	}

	@RequestMapping(value = "questions", method = RequestMethod.POST)
	public @ResponseBody
	@PreAuthorize("hasRole('ROLE_CONTRIBUTORS')")
	@ResponseStatus(HttpStatus.CREATED)
	QnADocument ask(@RequestBody QnADocument question) {
		// validate
		Contributor contributor = null; // TODO get contributor as filter op.
		return qnaService.ask(contributor, question);
	}

	@RequestMapping(value = "questions/{id}", method = RequestMethod.GET)
	public @ResponseBody
	QnADocument getFoo(@PathVariable(value = "id") String id) {
		// validate
		return qnaService.get("/foo/" + id);
	}

	@RequestMapping(value = "questions/{id}", method = RequestMethod.DELETE)
	public @ResponseBody
	@PreAuthorize("hasRole('ROLE_ADMINS')")
	ResponseEntity<?> delete(@PathVariable(value = "id") String id) {
		qnaService.delete("/foo/" + id);
		return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
	}

}
