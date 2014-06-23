package com.marklogic.samplestack.domain;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.marklogic.samplestack.exception.SamplestackSecurityException;

/**
 * An enum to index the properties that configure database connections.
 * TODO - prune to contrib and guest.
 */
public enum ClientRole {
	
	ADMIN, REST_ADMIN, SAMPLESTACK_CONTRIBUTOR, SAMPLESTACK_GUEST;
	private String getPrefix() {
		switch(this) {
    	case ADMIN: return "marklogic.admin"; 
    	case REST_ADMIN: return "marklogic.rest.admin"; 
    	case SAMPLESTACK_CONTRIBUTOR: return "marklogic.writer"; 
    	case SAMPLESTACK_GUEST: return "marklogic.guest";
    	default: throw new SamplestackSecurityException();
		}
	}
	
	public String getUserParam() {
		return getPrefix() + ".user";
	}
	
	public String getPasswordParam() {
		return getPrefix() + ".password";
	}
	
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
	
	public static String securityContextUserName() {
		SecurityContext secContext = SecurityContextHolder.getContext();
		String userName = secContext.getAuthentication().getName();
		return userName;
	}
}