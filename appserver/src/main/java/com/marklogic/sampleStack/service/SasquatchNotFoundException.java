package com.marklogic.sampleStack.service;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@SuppressWarnings("serial")
@ResponseStatus(HttpStatus.NOT_FOUND)
public class SasquatchNotFoundException extends RuntimeException {

	private final Logger logger = LoggerFactory
			.getLogger(SasquatchNotFoundException.class);

	public SasquatchNotFoundException() {
		logger.info("Resource Not Found Exception thrown by MarkLogic Client API");
	}

}
