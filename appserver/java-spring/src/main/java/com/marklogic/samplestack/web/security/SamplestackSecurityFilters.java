package com.marklogic.samplestack.web.security;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
/**
 *  Adds csrf token as header and also cors headers.
 */
public final class SamplestackSecurityFilters extends OncePerRequestFilter {
	@Override
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		CsrfToken token = (CsrfToken) request.getAttribute("_csrf");
		response.setHeader("X-CSRF-HEADER", token.getHeaderName());
		response.setHeader("X-CSRF-PARAM", token.getParameterName());
		response.setHeader(token.getHeaderName(), token.getToken());
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.setHeader("Access-Control-Allow-Methods",
				"POST, PUT, GET, OPTIONS, DELETE");
		response.setHeader("Access-Control-Max-Age", "3600");
		response.setHeader("Access-Control-Allow-Headers",
				"x-requested-with, content-type");
		filterChain.doFilter(request, response);

	}

}