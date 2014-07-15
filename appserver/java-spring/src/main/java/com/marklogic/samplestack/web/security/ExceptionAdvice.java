package com.marklogic.samplestack.web.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.samplestack.exception.SamplestackIOException;
import com.marklogic.samplestack.exception.SamplestackNotFoundException;

@ControllerAdvice
class ExceptionAdvice {
	
	@Autowired
	private JsonErrors errors;
	
	@ResponseStatus(HttpStatus.NOT_FOUND)
	@ExceptionHandler(SamplestackNotFoundException.class)
	public @ResponseBody JsonNode handleNotFound(Exception ex) {
		return errors.makeError(404, ex.getMessage());
	}
	
	@ResponseStatus(HttpStatus.METHOD_NOT_ALLOWED)
	@ExceptionHandler(HttpRequestMethodNotSupportedException.class)
	public @ResponseBody JsonNode handleMethodNotAllowed(Exception ex) {
		return errors.makeError(405, ex.getMessage());
	}
	
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ExceptionHandler(SamplestackIOException.class)
	public @ResponseBody JsonNode handleIOException(Exception ex) {
		return errors.makeError(400, ex.getMessage());
	}
}
