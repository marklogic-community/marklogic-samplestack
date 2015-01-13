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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.stereotype.Component;

/**
 * Wraps configuration of Spring security in once place.
 * Wires up the various handlers in this package, and provides
 * implementations for both the mocked application (see tests)
 * and an embedded LDAP configuration.
 */
@Component
public class SamplestackSecurityConfigurer {

	@Autowired
	private AuthenticationSuccessHandler successHandler;

	@Autowired
	private AuthenticationFailureHandler failureHandler;

	@Autowired
	private LogoutSuccessHandler logoutSuccessHandler;
	
	@Autowired
	private AuthenticationEntryPoint entryPoint;

	@Autowired
	private AccessDeniedHandler samplestackAccessDeniedHandler;
	

	public void configure(HttpSecurity http) throws Exception {
		http.authorizeRequests()
				.antMatchers(HttpMethod.GET, "/v1/session", "/v1/questions/**",
						"/v1/contributors/**", "/v1/hasVoted", "/**")
				.permitAll().and().authorizeRequests()
				.antMatchers(HttpMethod.POST, "/v1/search", "/v1/tags/**")
				.permitAll().and().authorizeRequests()
				.antMatchers("/v1/questions/**", "/v1/contributors/**")
				.authenticated().and().authorizeRequests().anyRequest()
				.denyAll();
		http.formLogin()
				.loginProcessingUrl("/v1/session")
				.failureHandler(failureHandler)
				.successHandler(successHandler)
				.permitAll()
				.and()
				.logout()
				.logoutRequestMatcher(
						new AntPathRequestMatcher("/v1/session", "DELETE"))
				.logoutSuccessHandler(logoutSuccessHandler).permitAll();
		http.csrf().disable();
		http.exceptionHandling().authenticationEntryPoint(entryPoint)
				.accessDeniedHandler(samplestackAccessDeniedHandler);

	}


	public void ldapConfiguation(AuthenticationManagerBuilder authManagerBuilder) throws Exception {
		authManagerBuilder.ldapAuthentication()

		.userDnPatterns("uid={0},ou=people", "uid={0},ou=apps")
				.groupSearchBase("ou=groups").contextSource()
				.ldif("classpath:samplestack-ds.ldif")
				.root("dc=samplestack,dc=org");

	}

}
