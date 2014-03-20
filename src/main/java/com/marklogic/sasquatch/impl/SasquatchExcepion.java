package com.marklogic.sasquatch.impl;

import java.io.IOException;

public class SasquatchExcepion extends RuntimeException {

	private Exception thrown;
	
	public SasquatchExcepion(IOException e) {
		this.thrown = e;
		e.printStackTrace();
	}

}
