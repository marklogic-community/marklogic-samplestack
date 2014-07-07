package com.marklogic.samplestack.web;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.exception.SamplestackNotFoundException;

@ControllerAdvice
class ExceptionAdvice {
	
	@Autowired
	private ObjectMapper mapper;
	
	private JsonNode makeError(String status, String message) {
		ObjectNode node = mapper.createObjectNode();
		node.put("status",  status);
		node.put("message", message);
		return node;
	}
	
	@ResponseStatus(HttpStatus.NOT_FOUND)
	@ExceptionHandler(SamplestackNotFoundException.class)
	public @ResponseBody JsonNode handleNotFound() {
		return makeError("404", "Not Found");
	}
	
}
