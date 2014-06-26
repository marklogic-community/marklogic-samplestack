package com.marklogic.samplestack.exception;

import com.marklogic.samplestack.exception.SamplestackException;

@SuppressWarnings("serial")
public class SampleStackDataIntegrityException extends SamplestackException {

	public SampleStackDataIntegrityException(Exception e) {
		super(e);
	}

	public SampleStackDataIntegrityException(String message) {
		super(message);
	}

}
