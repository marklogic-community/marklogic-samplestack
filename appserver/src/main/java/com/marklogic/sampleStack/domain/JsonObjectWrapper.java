package com.marklogic.sampleStack.domain;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

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
