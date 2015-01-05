package com.marklogic.samplestack.web.security;

import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;

import org.springframework.security.web.util.matcher.RegexRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

// here's how you have to hack in crsf protection for just some urls
// https://github.com/spring-projects/spring-boot/issues/179
public class CsrfRequestMatcher implements RequestMatcher {
	private Pattern allowedMethods = Pattern
			.compile("^(GET|HEAD|TRACE|OPTIONS)$");
	private RegexRequestMatcher apiMatcher = new RegexRequestMatcher(
			"/v1/(search|tags).*", null);

	@Override
	public boolean matches(HttpServletRequest request) {
		// No CSRF due to allowedMethod
		if (allowedMethods.matcher(request.getMethod()).matches())
			return false;

		// No CSRF due to api call
		if (apiMatcher.matches(request))
			return false;

		// CSRF for everything else that is not an API call or an allowedMethod
		return true;
	}
}
