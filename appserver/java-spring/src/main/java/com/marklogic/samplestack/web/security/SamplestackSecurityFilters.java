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
 *  Adds CSRF token as header if it exists in the current
 *  request, and also includes CORS headers.
 */
class SamplestackSecurityFilters extends OncePerRequestFilter {
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