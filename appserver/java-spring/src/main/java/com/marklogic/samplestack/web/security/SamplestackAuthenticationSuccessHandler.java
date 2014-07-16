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
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.service.ContributorService;

@Component
// credit to TODO
// http://www.baeldung.com/2011/10/31/securing-a-restful-web-service-with-spring-security-3-1-part-3/
public class SamplestackAuthenticationSuccessHandler extends
		SimpleUrlAuthenticationSuccessHandler {

	@Autowired
	private ObjectMapper mapper;
	
	@Autowired
	private ContributorService contributorService;
	

	private RequestCache requestCache = new HttpSessionRequestCache();

	@Override
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
		ArrayNode roleNode = mapper.createArrayNode();
		roleNode.add(ClientRole.securityContextRole().toString());
		
		userNode.put("role", roleNode);
		mapper.writeValue(writer, userNode);
		writer.close();
	}

	public void setRequestCache(RequestCache requestCache) {
		this.requestCache = requestCache;
	}
}