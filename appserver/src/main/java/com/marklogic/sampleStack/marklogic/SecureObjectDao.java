package com.marklogic.sampleStack.marklogic;

import com.marklogic.sampleStack.domain.SecureObject;




// the idea of this interface is to provide a mock LDAP security layer over administrative obejcts.
public interface SecureObjectDao {

	public SecureObject getObject(String uri);
	public void storeSecureObject(String uri, SecureObject o);
	
	public SecureObject getAnnotatedDocument(SecureObject o);
	
}
