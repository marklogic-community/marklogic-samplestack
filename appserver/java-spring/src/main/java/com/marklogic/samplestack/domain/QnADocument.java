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
