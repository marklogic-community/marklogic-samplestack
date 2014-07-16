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

@Component
public class SamplestackAuthenticationFailureHandler extends
		SimpleUrlAuthenticationFailureHandler {

	@Autowired
	private JsonHttpResponse errors;
	
	@Override
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
