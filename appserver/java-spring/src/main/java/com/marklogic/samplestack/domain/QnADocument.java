package com.marklogic.samplestack.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;


public class QnADocument extends JsonObjectWrapper {
	
	public QnADocument(ObjectMapper mapper, String question, String markdown) {
		super(mapper.createObjectNode());
		this.json.put("title", question);
		this.json.put("body", markdown);
	}
	
	
	public QnADocument(ObjectNode jsonObject) {
		super(jsonObject);
	}
	
}
