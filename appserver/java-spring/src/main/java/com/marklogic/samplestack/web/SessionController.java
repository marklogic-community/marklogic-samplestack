package com.marklogic.samplestack.web;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;


@RestController
public class SessionController {

	@Autowired
	private ObjectMapper mapper;
	
	@RequestMapping(value = "session", method = RequestMethod.GET)
	public @ResponseBody String hello(HttpServletRequest request) {
		
//		CsrfToken csrfToken = (CsrfToken) request.getAttribute("_csrf");
//		
//		String headerName = csrfToken.getHeaderName();
//		String token = csrfToken.getToken();
//		
//		ObjectNode objectNode = mapper.createObjectNode();
//		objectNode.put("headerName", headerName);
//		objectNode.put("token", token);
//		
//		return objectNode;
		return "hello";
	}
}
