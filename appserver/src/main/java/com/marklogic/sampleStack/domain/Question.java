package com.marklogic.sampleStack.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;


public class Question extends JsonObjectWrapper {
	
	public Question(ObjectMapper mapper, String question) {
		super(mapper.createObjectNode());
		this.json.put("title", question);
	}
	
	public Question(ObjectNode jsonObject) {
		super(jsonObject);
	}
	

}
