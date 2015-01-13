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
package com.marklogic.samplestack.mock;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.stereotype.Component;

import com.marklogic.samplestack.web.security.SamplestackSecurityConfigurer;

@EnableWebSecurity
@Component
@EnableGlobalMethodSecurity(prePostEnabled = true)
/**
 * A version of ApplicationSecurity that bypasses LDAP,
 * providing an in-memory authentication/authorization object.
 */
public class MockApplicationSecurity extends WebSecurityConfigurerAdapter {

	@Autowired
	private SamplestackSecurityConfigurer configurer;

	@Override
	protected void configure(HttpSecurity http) throws Exception {
		configurer.configure(http);
	}

	@Override
	protected void configure(AuthenticationManagerBuilder authManagerBuilder)
			throws Exception {
		authManagerBuilder.inMemoryAuthentication()
				.withUser("testC1@example.com")
					.password("c1")
					.roles("CONTRIBUTORS").and()
				.withUser("testA1@example.com")
					.password("a1")
					.roles("CONTRIBUTORS", "ADMINS");
	}

}
