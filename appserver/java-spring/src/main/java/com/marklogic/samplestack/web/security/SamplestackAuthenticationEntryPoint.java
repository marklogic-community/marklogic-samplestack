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

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

import org.apache.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.marklogic.samplestack.web.JsonHttpResponse;

/**
 * Class to customize the default Login handling.  Rather than redirection
 * to a login form, Samplestack simply denies access
 * (where authentication is required)
 */
@Component
public class SamplestackAuthenticationEntryPoint implements
		AuthenticationEntryPoint {

	@Autowired
	private JsonHttpResponse errors;

	@Override
	/**
	 * Override handler that returns 401 for any unauthenticated
	 * request to a secured endpoint.
	 */
	public void commence(HttpServletRequest request,
			HttpServletResponse response, AuthenticationException authException)
			throws IOException {

		HttpServletResponseWrapper responseWrapper = new HttpServletResponseWrapper(
				response);
		Writer out = responseWrapper.getWriter();
		
		if (request.getMethod().equals("OPTIONS")) {
			responseWrapper.setStatus(HttpStatus.SC_OK);
			errors.writeJsonResponse(out, HttpStatus.SC_OK, "OK");
		}
		else {
			responseWrapper.setStatus(HttpStatus.SC_UNAUTHORIZED);
			errors.writeJsonResponse(out, HttpStatus.SC_UNAUTHORIZED, "Unauthorized");
		}
		out.close();
	}
}
