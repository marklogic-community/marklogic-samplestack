package com.marklogic.samplestack.exception;


@SuppressWarnings("serial")
public class SamplestackException extends RuntimeException {

	@SuppressWarnings("unused")
	private Exception thrown;
	
	public SamplestackException(Exception e) {
		this.thrown = e;
		e.printStackTrace();
	}

}
