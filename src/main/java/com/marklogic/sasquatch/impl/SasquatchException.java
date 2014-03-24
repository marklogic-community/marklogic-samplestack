package com.marklogic.sasquatch.impl;


@SuppressWarnings("serial")
public class SasquatchException extends RuntimeException {

	@SuppressWarnings("unused")
	private Exception thrown;
	
	public SasquatchException(Exception e) {
		this.thrown = e;
		e.printStackTrace();
	}

}
