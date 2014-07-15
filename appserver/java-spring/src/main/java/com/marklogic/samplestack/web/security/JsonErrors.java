package com.marklogic.samplestack.web.security;

import java.io.IOException;
import java.io.Writer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Component
public class JsonErrors {

	@Autowired
	private ObjectMapper mapper;
	
	/**
	 * Make a JSON object to encapsulate the Http Response Body.
	 * @param status
	 * @param message
	 * @return a JSONNode to return as Response Body
	 */
	public JsonNode makeError(int status, String message) {
		ObjectNode node = mapper.createObjectNode();
		node.put("status",  status);
		node.put("message", message);
		return node;
	}

	public void writeError(Writer out, int status, String message) throws IOException {
		JsonNode error = makeError(status, message);
		mapper.writeValue(out, error);
	}
	
}
