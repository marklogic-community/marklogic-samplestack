package com.marklogic.samplestack.impl;

import com.marklogic.samplestack.exception.SamplestackException;

@SuppressWarnings("serial")
public class SampleStackVotingException extends SamplestackException {

	public SampleStackVotingException(Exception e) {
		super(e);
	}

	public SampleStackVotingException(String message) {
		super(message);
	}

}
