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

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.marklogic.samplestack.exception.SamplestackSecurityException;

/**
 * Provides the keys to two different database connections,
 * and a method for referring to their properties in build.gradle.
 */
public enum ClientRole {
	
	SAMPLESTACK_CONTRIBUTOR, SAMPLESTACK_GUEST;
	private String getPrefix() {
		switch(this) {
    	case SAMPLESTACK_CONTRIBUTOR: return "marklogic.writer"; 
    	case SAMPLESTACK_GUEST: return "marklogic.guest";
    	default: throw new SamplestackSecurityException();
		}
	}
	
	/**
	 * Gets the name of the user parameter for this ClientRole.
	 * @return username parameter used in build.gradle to configure the database connection.
	 */
	public String getUserParam() {
		return getPrefix() + ".user";
	}
	
	/**
	 * Gets the name of the password parameter for this ClientRole.
	 * @return username parameter used in build.gradle to configure the database connection.
	 */
	public String getPasswordParam() {
		return getPrefix() + ".password";
	}
	
	/**
	 * Provides the database client role implied by the security context for the spring application.
	 * @return The ClientRole enum value that corresponds to the current logged-in user.
	 */
	public static ClientRole securityContextRole() {
		SecurityContext secContext = SecurityContextHolder.getContext();
		Collection<? extends GrantedAuthority> auths = secContext.getAuthentication().getAuthorities();
		if (auths.contains(new SimpleGrantedAuthority("ROLE_CONTRIBUTORS"))) {
			return SAMPLESTACK_CONTRIBUTOR;
		}
		else {
			return SAMPLESTACK_GUEST;
		}
	}
	
	/**
	 * Provides the username for implied by the security context for the spring application.
	 * @return The username value that corresponds to the current logged-in user.
	 */
	public static String securityContextUserName() {
		SecurityContext secContext = SecurityContextHolder.getContext();
		String userName = secContext.getAuthentication().getName();
		return userName;
	}
}