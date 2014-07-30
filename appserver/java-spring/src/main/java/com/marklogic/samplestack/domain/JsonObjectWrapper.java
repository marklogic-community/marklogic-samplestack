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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

/**
 * Abstract class to support a thinly wrapped JSON node, 
 * intended largely as a pass-through object to the browser client.
 */
public abstract class JsonObjectWrapper {
	
	protected ObjectNode json;

	protected JsonObjectWrapper(ObjectNode json) {
		this.json = json;
	}
	
	public String getId() {
		return json.get("id").asText();
	}
	
	public void setId(String id) {
		json.put("id", id);
	}
	
	public JsonNode getJson() {
		return json;
	}
	
}
