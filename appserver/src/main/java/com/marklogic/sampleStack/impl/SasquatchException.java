package com.marklogic.sampleStack.impl;


@SuppressWarnings("serial")
public class SasquatchException extends RuntimeException {

	@SuppressWarnings("unused")
	private Exception thrown;
	
	public SasquatchException(Exception e) {
		this.thrown = e;
		e.printStackTrace();
	}

}
