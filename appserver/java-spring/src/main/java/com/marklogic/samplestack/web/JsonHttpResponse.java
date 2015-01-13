/*
 * Copyright 2012-2015 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.samplestack.web;

import java.io.IOException;
import java.io.Writer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

/**
 * Utility class to create simple Http responses in JSON, especially errors.
 */
@Component
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

	/**
	 * Write a constructed JSON object to a Writer.
	 * @param out The Writer on which to write the object.
	 * @param status The http status to put in the JSON object.
	 * @param message The message to include in the response body.
	 */
	public void writeJsonResponse(Writer out, int status, String message) throws IOException {
		JsonNode error = makeJsonResponse(status, message);
		mapper.writeValue(out, error);
	}
	
}
