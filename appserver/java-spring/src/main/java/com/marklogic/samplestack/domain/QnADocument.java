/*
 * Copyright 2012-2014 MarkLogic Corporation
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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;


public class QnADocument extends JsonObjectWrapper {
	
	public QnADocument(ObjectMapper mapper, String title, String text) {
		super(mapper.createObjectNode());
		this.json.put("title", title);
		this.json.put("text", text);
	}
	
	
	public QnADocument(ObjectNode jsonObject) {
		super(jsonObject);
	}


	public QnADocument(ObjectMapper mapper, String title, String text,
			String... tags) {
		this(mapper, title, text);
		ArrayNode tagNode = mapper.createArrayNode();
		for (String tag : tags) {
			tagNode.add(tag);
		}
		this.json.put("tags", tagNode);
	}


	/**
	 * Access to the owner username is required for knowing whether to allow a question acceptance.
	 * @return The userName of the QnA document's question.
	 */
	public String getOwnerUserName() {
		return getJson().get("owner").get("userName").asText();
	}
	
}
