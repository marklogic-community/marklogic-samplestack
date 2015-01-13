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
package com.marklogic.samplestack.web.security;

import java.io.IOException;
import java.io.Writer;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.savedrequest.RequestCache;
import org.springframework.security.web.savedrequest.SavedRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.service.ContributorService;

/**
 * On authentication success, this customization returns a 200 OK
 * with the logged-in contributor's profile information inline.
 * 
 * See http://www.baeldung.com/2011/10/31/securing-a-restful-web-service-with-spring-security-3-1-part-3/
 * for the inspiration for this method.
 */
@Component
public class SamplestackAuthenticationSuccessHandler extends
		SimpleUrlAuthenticationSuccessHandler {

	@Autowired
	private ObjectMapper mapper;
	
	@Autowired
	private ContributorService contributorService;
	

	private RequestCache requestCache = new HttpSessionRequestCache();

	@Override
	/**
	 * Override handler that sends 200 OK to client along with JSON
	 * for the logged-in user.
	 */
	public void onAuthenticationSuccess(HttpServletRequest request,
			HttpServletResponse response, Authentication authentication)
			throws ServletException, IOException {
		SavedRequest savedRequest = requestCache.getRequest(request, response);
		String targetUrlParam = getTargetUrlParameter();
		if (savedRequest != null
				&& isAlwaysUseDefaultTargetUrl()
				|| (targetUrlParam != null && StringUtils.hasText(request
						.getParameter(targetUrlParam)))) {
			requestCache.removeRequest(request, response);
		}

		clearAuthenticationAttributes(request);
		HttpServletResponseWrapper responseWrapper = new HttpServletResponseWrapper(
				response);
		Writer writer = responseWrapper.getWriter();
		String userName = ClientRole.securityContextUserName();

		ObjectNode userNode;

		Contributor contributor = contributorService.getByUserName(userName);
		if (contributor != null) {
			userNode = mapper.convertValue(contributor, ObjectNode.class);
		} else {
			userNode = mapper.createObjectNode();
			userNode.put("userName", userName);
		}
		ArrayNode roleNode = userNode.putArray("role");
		roleNode.add(ClientRole.securityContextRole().toString());
		
		mapper.writeValue(writer, userNode);
		writer.close();
	}

	public void setRequestCache(RequestCache requestCache) {
		this.requestCache = requestCache;
	}
}