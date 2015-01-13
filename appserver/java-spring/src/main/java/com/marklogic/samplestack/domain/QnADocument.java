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
package com.marklogic.samplestack.domain;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;


/**
 * Class that wraps a JSON document and its ID.  
 * The main payload for operations on questions and answers.
 *
 */
public class QnADocument {
	
	protected ObjectNode json;

	public String getId() {
		return json.get("id").asText();
	}
	
	public void setId(String id) {
		json.put("id", id);
	}
	
	public JsonNode getJson() {
		return json;
	}
	
	/**
	 * Constructor for QnADocuments that includes just a mapper and Strings for title and text.
	 * @param mapper An ObjectMapper in charge of serialization/deserialization.
	 * @param title Title of the question.
	 * @param text Text (markdown) of the question.
	 */
	public QnADocument(ObjectMapper mapper, String title, String text) {
		this.json = mapper.createObjectNode();
		this.json = this.json.put("title", title);
		this.json.put("text", text);
	}
	
	
	/**
	 * Constructor to make a QnADocument from an in-hand JSON node.
	 * @param jsonObject A JSON node that contains a question and answer document.
	 */
	public QnADocument(ObjectNode jsonObject) {
		this.json = jsonObject;
	}


	/**
	 * Constructor that includes tags to append to the QnADocument.
	 * @param mapper An ObjectMapper in charge of serialization/deserialization.
	 * @param title Title of the question.
	 * @param text Text (markdown) of the question.
	 * @param tags 0 or more tags to categorize this question.
	 */
	public QnADocument(ObjectMapper mapper, String title, String text,
			String... tags) {
		this(mapper, title, text);
		ArrayNode tagNode = this.json.putArray("tags");
		for (String tag : tags) {
			tagNode.add(tag);
		}
	}


	/**
	 * Access to the owner username is required for knowing whether to allow 
	 * a user to accept an answer.
	 * @return The userName of the QnA document's question.
	 */
	public String getOwnerUserName() {
		return getJson().get("owner").get("userName").asText();
	}
	
}
