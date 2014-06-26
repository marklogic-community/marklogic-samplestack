package com.marklogic.samplestack.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.marklogic.samplestack.exception.SamplestackException;

@SuppressWarnings("serial")
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class SampleStackDataIntegrityException extends SamplestackException {

	public SampleStackDataIntegrityException(Exception e) {
		super(e);
	}

	public SampleStackDataIntegrityException(String message) {
		super(message);
	}

}
