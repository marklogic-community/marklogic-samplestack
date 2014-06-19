package com.marklogic.samplestack.domain;

import static org.junit.Assert.assertEquals;

import java.io.IOException;

import org.junit.Test;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.impl.CustomObjectMapper;

public class QnADocumentTest {

	ObjectMapper mapper = new CustomObjectMapper();
	QnADocument doc;
	
	@Test 
	public void testQnADoc() throws JsonParseException, JsonMappingException, IOException {
		ObjectNode node = mapper.readValue("{\"id\":\"x\",\"owner\":{\"userName\":\"charles\"}}", ObjectNode.class);
		doc = new QnADocument(node);
		assertEquals("x", doc.getId());
		assertEquals("charles", doc.getOwnerUserName());
	}
}
