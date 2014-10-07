package com.marklogic.samplestack.exception;

@SuppressWarnings("serial")
public class SamplestackInvalidParameterException extends SamplestackException {

	public SamplestackInvalidParameterException(Exception e) {
		super(e);
	}

	public SamplestackInvalidParameterException(String message) {
		super(message);
	}

}
