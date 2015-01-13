/*
 * Copyright 2012-2015 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.service.ContributorService;

/**
 * Controller to provide initial session information to the browser,
 * for CSRF protection and Login session.
 */
@RestController
public class SessionController {

	@Autowired
	private JsonHttpResponse errors;

	@Autowired 
	private ObjectMapper mapper;

	@Autowired 
	private ContributorService contributorService;

	/**
	 * Exposes endpoint that returns CSRF token information and a session for use in login.
	 * @param request The Http Request.
	 * @param response The Http response.
	 * @return A JsonNode with bare-bones acknowledgement.
	 */
	@RequestMapping(value = "v1/session", method = RequestMethod.GET)
	public @ResponseBody JsonNode getSession(HttpServletRequest request,
			HttpServletResponse response) {

		// not logged in
		if (ClientRole.securityContextRole() == ClientRole.SAMPLESTACK_GUEST)  {
			CsrfToken csrfToken = (CsrfToken) request.getAttribute("_csrf");

			if (csrfToken == null) {
				return errors.makeJsonResponse(400, "Getting unauthenticated session requires _csrf attribute");
			}
			else {
				String headerName = csrfToken.getHeaderName();
				String token = csrfToken.getToken();
				HttpServletResponseWrapper responseWrapper = new HttpServletResponseWrapper(
						response);

				responseWrapper.addHeader(headerName, token);
				return errors.makeJsonResponse(200, "New Session");
			}
		}
		else {
			ObjectNode userNode;
			String userName = ClientRole.securityContextUserName();
			Contributor contributor = contributorService.getByUserName(userName);
			if (contributor != null) {
				userNode = mapper.convertValue(contributor, ObjectNode.class);
			} else {
				userNode = mapper.createObjectNode();
				userNode.put("userName", userName);
			}
			ArrayNode roleNode = userNode.putArray("role");
			roleNode.add(ClientRole.securityContextRole().toString());
			return userNode;
		}
	}
}
