package com.marklogic.sampleStack.web;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.marklogic.sampleStack.service.MarkLogicOperations;

@Controller
public class DocumentController {

	@Autowired
	private MarkLogicOperations jsonOps;

	@RequestMapping(value = "docs", method = RequestMethod.GET)
	public @ResponseBody
	String getDocumentByUri(@RequestParam("docUri") String docUri) {
		return jsonOps.getJsonDocument(docUri);
	}
}
