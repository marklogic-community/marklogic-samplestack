package com.marklogic.samplestack.exception;


/**
 * Catches invalid searches, so that the middle
 * tier can complain to the browser with a 400
 */
@SuppressWarnings("serial")
public class SamplestackSearchException extends SamplestackException {

	public SamplestackSearchException(Exception ex) {
		super(ex);
	}
	
	public SamplestackSearchException(String message) {
		super(message);
	}

}
