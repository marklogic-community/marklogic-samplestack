package com.marklogic.samplestack.web;

import java.io.IOException;
import java.io.Writer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Component
/**
 * Utility class to create simple Http responses in JSON, especially errors.
 */
public class JsonHttpResponse {

	@Autowired
	private ObjectMapper mapper;
	
	/**
	 * Make a JSON object to encapsulate the Http Response Body.
	 * @param status
	 * @param message
	 * @return a JSONNode to return as Response Body
	 */
	public JsonNode makeJsonResponse(int status, String message) {
		ObjectNode node = mapper.createObjectNode();
		node.put("status",  status);
		node.put("message", message);
		return node;
	}

	public void writeJsonResponse(Writer out, int status, String message) throws IOException {
		JsonNode error = makeJsonResponse(status, message);
		mapper.writeValue(out, error);
	}
	
}
