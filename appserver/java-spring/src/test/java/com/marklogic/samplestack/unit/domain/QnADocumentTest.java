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
package com.marklogic.samplestack.unit.domain;

import static org.junit.Assert.assertEquals;

import java.io.IOException;

import org.junit.Test;
import org.junit.experimental.categories.Category;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.dbclient.CustomObjectMapper;
import com.marklogic.samplestack.domain.QnADocument;
import com.marklogic.samplestack.testing.UnitTests;

@Category(UnitTests.class)
/**
 * Unit tests for QnADocument domain object
 */
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
