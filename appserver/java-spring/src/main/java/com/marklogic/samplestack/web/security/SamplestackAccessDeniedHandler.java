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

@Component
public class SamplestackAccessDeniedHandler implements AccessDeniedHandler {

	@Autowired
	private JsonHttpResponse errors;
	
	@Override
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
