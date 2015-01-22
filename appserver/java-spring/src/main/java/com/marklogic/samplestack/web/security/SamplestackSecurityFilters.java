package com.marklogic.samplestack.web.security;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 *  Customization to Spring Security. 
 *  Adds CSRF token as header if it exists in the current
 *  request, and also includes CORS headers.
 */
class SamplestackSecurityFilters extends OncePerRequestFilter {
	
	/** Spring provides this object at startup, for access to environment configuration
	 */
	private Environment env;
	
	public SamplestackSecurityFilters(Environment env) {
		this.env = env;
	}

	@Override
	/**
	 * Hooks into Spring Security filter mechanism to manipulate
	 * headers as needed.
	 */
	protected void doFilterInternal(HttpServletRequest request,
			HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		CsrfToken token = (CsrfToken) request.getAttribute("_csrf");
		// do not include token on any CORS options call.
		if (token != null && !request.getMethod().equals("OPTIONS")) {
			response.setHeader("X-CSRF-HEADER", token.getHeaderName());
			response.setHeader("X-CSRF-PARAM", token.getParameterName());
			response.setHeader(token.getHeaderName(), token.getToken());
		}
		
		/*
		 * CORS headers.
		 * in gradle.properties, set cors-allow-hosts to the address of the
		 * browser application to allow direct access.
		 * Note, this implementation actually doesn't provide CORS protection!
		 */
		response.setHeader("Access-Control-Allow-Origin", env.getProperty("cors.allow.hosts"));
		response.setHeader("Access-Control-Allow-Methods",
				"POST, PUT, GET, OPTIONS, DELETE");
		response.setHeader("Access-Control-Max-Age", "3600");
		response.setHeader("Access-Control-Allow-Headers",
				"x-requested-with, content-type, X-CSRF-TOKEN");
		filterChain.doFilter(request, response);

	}

}