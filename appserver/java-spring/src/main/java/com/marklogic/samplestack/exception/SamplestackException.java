package com.marklogic.samplestack.exception;


@SuppressWarnings("serial")
public class SamplestackException extends RuntimeException {

	
	public SamplestackException(Exception e) {
		super(e);
	}

	public SamplestackException(String message) {
		super(message);
	}

}
