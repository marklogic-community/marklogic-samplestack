package com.marklogic.samplestack.domain;

import com.marklogic.samplestack.exception.SampleStackSecurityException;

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
    	default: throw new SampleStackSecurityException();
		}
	}
	public String getUserParam() {
		return getPrefix() + ".user";
	}
	public String getPasswordParam() {
		return getPrefix() + ".password";
	}
}