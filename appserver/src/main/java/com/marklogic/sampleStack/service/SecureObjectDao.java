package com.marklogic.sampleStack.service;

import org.springframework.security.access.prepost.PreAuthorize;

import com.marklogic.sampleStack.domain.SecureObject;




// the idea of this interface is to provide a mock LDAP security layer over administrative obejcts.
public interface SecureObjectDao {

	public SecureObject getObject(String uri);
	

    @PreAuthorize("hasRole('ROLE_EXPERT')")
	public void storeSecureObject(String uri, SecureObject o);
	
	public SecureObject getAnnotatedDocument(SecureObject o);
	
}
