package com.marklogic.samplestack.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@SuppressWarnings("serial")
@ResponseStatus(value=HttpStatus.BAD_REQUEST, reason="Wrong authority to accept answer.")
public class SamplestackAcceptException extends SamplestackException {

	public SamplestackAcceptException(Exception e) {
		super(e);
	}

	public SamplestackAcceptException(String message) {
		super(message);
	}

	
}
