package com.marklogic.samplestack.web;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.csrf.CsrfToken;
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
	public @ResponseBody JsonNode hello(HttpServletRequest request,
			HttpServletResponse response) {

		CsrfToken csrfToken = (CsrfToken) request.getAttribute("_csrf");

		String headerName = csrfToken.getHeaderName();
		String token = csrfToken.getToken();
		HttpServletResponseWrapper responseWrapper = new HttpServletResponseWrapper(
				response);

		responseWrapper.addHeader(headerName, token);
		return errors.makeJsonResponse(200, "New Session");
	}
}
