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
import static org.junit.Assert.assertFalse;

import java.io.IOException;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.samplestack.dbclient.CustomObjectMapper;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.SparseContributor;
import com.marklogic.samplestack.testing.UnitTests;
import com.marklogic.samplestack.testing.Utils;

@Category(UnitTests.class)
/**
 * Unit tests for Contributor domain object.
 */
public class ContributorTest {

	Contributor testC1, mary;
	ObjectMapper mapper =  new CustomObjectMapper();
	
	@Before
	public void init() throws JsonParseException, JsonMappingException, IOException {
		testC1 = Utils.testC1;
		mary = Utils.testA1;
	}
	
	@Test
	public void testTheTestJson() {
		assertEquals("testC1", testC1.getDisplayName());
		assertEquals("Some text about a basic user", testC1.getAboutMe());
		assertEquals(Utils.testC1UUID, testC1.getId());
		assertEquals("Barrow", testC1.getLocation());
		// assertEquals(0, joe.getReputation());
		assertEquals("testC1@example.com", testC1.getUserName());
		// assertEquals(0, joe.getVotes().size());
		assertEquals("http://website.com/grechaw", testC1.getWebsiteUrl());
	}
	
	@Test
	public void testSparseContributor() throws JsonProcessingException {
		SparseContributor sparseJoe = Utils.testC1.asSparseContributor();
		assertEquals("testC1", sparseJoe.getDisplayName());
		assertEquals("testC1@example.com", sparseJoe.getUserName());
		String sparseToString = mapper.writeValueAsString(sparseJoe);
		assertFalse("Some text about a basic user", sparseToString.contains("Some text about"));
	}
}
