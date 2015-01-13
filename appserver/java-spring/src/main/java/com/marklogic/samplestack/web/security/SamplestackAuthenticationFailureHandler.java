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
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import com.marklogic.samplestack.web.JsonHttpResponse;

/**
 * Customization to default Spring Security behavior, which
 * simply provides a 401 response to the client then authenication fails.
 */
@Component
public class SamplestackAuthenticationFailureHandler extends
		SimpleUrlAuthenticationFailureHandler {

	@Autowired
	private JsonHttpResponse errors;
	
	@Override
	/**
	 * Override handler that returns 401 after failed authentication.
	 */
	public void onAuthenticationFailure(HttpServletRequest request,
			HttpServletResponse response, AuthenticationException exception)
			throws IOException, ServletException {
		
		HttpServletResponseWrapper responseWrapper = new HttpServletResponseWrapper(
				response);
		responseWrapper.setStatus(HttpStatus.SC_UNAUTHORIZED);
		
		Writer out = responseWrapper.getWriter();
		errors.writeJsonResponse(out, HttpStatus.SC_UNAUTHORIZED, "Unauthorized");
		out.close();
	}

}
