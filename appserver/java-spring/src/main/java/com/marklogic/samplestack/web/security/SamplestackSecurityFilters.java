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

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 *  Customization to Spring Security. 
 *  Adds CSRF token as header if it exists, and also CORS headers.
 */
@Component
public final class SamplestackSecurityFilters extends OncePerRequestFilter {
	@Override
	/**
	 * Hooks into Spring Security filter mechanism to manipulate
	 * headers as needed.
	 */
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		CsrfToken token = (CsrfToken) request.getAttribute("_csrf");
		if (token != null) {
			response.setHeader("X-CSRF-HEADER", token.getHeaderName());
			response.setHeader("X-CSRF-PARAM", token.getParameterName());
			response.setHeader(token.getHeaderName(), token.getToken());
		}
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.setHeader("Access-Control-Allow-Methods",
				"POST, PUT, GET, OPTIONS, DELETE");
		response.setHeader("Access-Control-Max-Age", "3600");
		response.setHeader("Access-Control-Allow-Headers",
				"x-requested-with, content-type");
		filterChain.doFilter(request, response);

	}

}