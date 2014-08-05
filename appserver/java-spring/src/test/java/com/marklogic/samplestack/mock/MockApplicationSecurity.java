/*
 * Copyright 2012-2014 MarkLogic Corporation
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
package com.marklogic.samplestack.mock;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.stereotype.Component;

import com.marklogic.samplestack.web.security.SamplestackAuthenticationSuccessHandler;


@EnableWebSecurity
@Component
@EnableGlobalMethodSecurity(prePostEnabled = true)
/**
 * A version of ApplicationSecurity that bypasses LDAP,
 * providing an in-memory authentication/authorization object.
 */
public class MockApplicationSecurity extends WebSecurityConfigurerAdapter {

	@Autowired
	private SamplestackAuthenticationSuccessHandler successHandler;

	@Autowired
	private AuthenticationFailureHandler failureHandler;

	@Autowired
	private AuthenticationEntryPoint entryPoint;
	
	@Autowired
	private AccessDeniedHandler samplestackAccessDeniedHandler;
	
	@Autowired
	private LogoutSuccessHandler logoutSuccessHandler;
	
	@Override
	protected void configure(HttpSecurity http) throws Exception {
		http
			.authorizeRequests()
				.antMatchers(HttpMethod.GET, "/session", "/questions/**", "/tags/**").permitAll()
			.and()
			.authorizeRequests()
				.antMatchers(HttpMethod.POST, "/search").permitAll()
			.and()
				.authorizeRequests().antMatchers("/questions/**", "/contributors/**")
				.authenticated()
			.and()
				.authorizeRequests().anyRequest().denyAll();
		http.formLogin()
		        .failureHandler(failureHandler)
				.successHandler(successHandler)
				.permitAll().and()
			.logout()
				.logoutSuccessHandler(logoutSuccessHandler)
				.permitAll();
		http.csrf().disable();
		http.exceptionHandling().authenticationEntryPoint(entryPoint)
		.accessDeniedHandler(samplestackAccessDeniedHandler);
		
	}



	@Override
	protected void configure(AuthenticationManagerBuilder authManagerBuilder)
			throws Exception {

		 authManagerBuilder.inMemoryAuthentication()
         .withUser("joeUser@marklogic.com").password("joesPassword").roles("CONTRIBUTORS").and()
         .withUser("maryAdmin@marklogic.com").password("marysPassword").roles("CONTRIBUTORS", "ADMINS");

	}
	
}