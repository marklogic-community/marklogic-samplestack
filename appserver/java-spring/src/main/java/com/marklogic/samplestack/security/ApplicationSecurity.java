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
package com.marklogic.samplestack.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.stereotype.Component;

import com.marklogic.samplestack.web.security.SamplestackSecurityConfigurer;

/**
 * The Spring Security configuration for Samplestack.
 * Contains configuration for the web-tier security,
 * including the embedded LDAP backend configuration and the
 * user-facing method for securing the application's endpoints.
 */
@EnableWebSecurity
@Component
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class ApplicationSecurity extends WebSecurityConfigurerAdapter {

	
	@Autowired
	private SamplestackSecurityConfigurer configurer;

	@Override
	/**
	 * Standard practice in Spring Security is to provide
	 * this implementation method for building security.  This method
	 * configures the endpoints' security characteristics.
	 * @param http  Security object provided by the framework.
	 */
	protected void configure(HttpSecurity http) throws Exception {
		configurer.configure(http);
		
	}

	@Override
	/**
	 * Standard practice in Spring Security is to provide a hook for configuring
	 * the authentication manager.  This configuration sets up an embedded LDAP
	 * server.
	 * @param authManagerBuilder  a builder provided by the framework.
	 */
	protected void configure(AuthenticationManagerBuilder authManagerBuilder)
			throws Exception {
		configurer.ldapConfiguation(authManagerBuilder);
	}

}
