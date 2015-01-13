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

import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import com.marklogic.samplestack.web.JsonHttpResponse;

/**
 * Custom handler to override default Spring Security login behavior.
 * This handler returns 403 for any resource not allowed by the security
 * configuration.
 */
@Component
public class SamplestackAccessDeniedHandler implements AccessDeniedHandler {

	@Autowired
	private JsonHttpResponse errors;
	
	@Override
	/**
	 * Handler override to return 403s on the HttpResponse.
	 */
	public void handle(HttpServletRequest request,
			HttpServletResponse response,
			AccessDeniedException accessDeniedException) throws IOException,
			ServletException {
		HttpServletResponseWrapper responseWrapper = new HttpServletResponseWrapper(
				response);
		responseWrapper.setStatus(HttpStatus.SC_FORBIDDEN);
		
		Writer out = responseWrapper.getWriter();
		errors.writeJsonResponse(out, HttpStatus.SC_FORBIDDEN, "Forbidden");
		out.close();
		}

}
