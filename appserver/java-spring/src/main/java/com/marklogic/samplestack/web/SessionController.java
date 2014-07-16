package com.marklogic.samplestack.web;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;


@RestController
public class SessionController {

	@Autowired
	private JsonHttpResponse errors;
	
	@RequestMapping(value = "session", method = RequestMethod.GET)
	public @ResponseBody JsonNode hello(HttpServletRequest request) {
		return errors.makeJsonResponse(200, "New Session");
	}
}
