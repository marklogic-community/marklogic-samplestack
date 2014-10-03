package com.marklogic.samplestack.exception;

@SuppressWarnings("serial")
public class SamplestackUnsupportedException extends SamplestackException {

	public SamplestackUnsupportedException(Exception e) {
		super(e);
	}

	public SamplestackUnsupportedException(String message) {
		super(message);
	}

}
