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
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.SparseContributor;
import com.marklogic.samplestack.impl.CustomObjectMapper;
import com.marklogic.samplestack.testing.UnitTests;
import com.marklogic.samplestack.testing.Utils;

@Category(UnitTests.class)
/**
 * Unit tests for Contributor domain object.
 */
public class ContributorTest {

	Contributor joe, mary;
	ObjectMapper mapper =  new CustomObjectMapper();
	
	@Before
	public void initFS() throws JsonParseException, JsonMappingException, IOException {
		joe = Utils.joeUser;
		mary = Utils.maryUser;
	}
	
	@Test
	public void testTheTestJson() {
		assertEquals("joeUser", joe.getDisplayName());
		assertEquals("Some text about a basic user", joe.getAboutMe());
		assertEquals(Utils.JoesUUID, joe.getId());
		assertEquals("Barrow", joe.getLocation());
		assertEquals(0, joe.getReputation());
		assertEquals("joeUser@marklogic.com", joe.getUserName());
		assertEquals(0, joe.getVotes().size());
		assertEquals("http://website.com/grechaw", joe.getWebsiteUrl());
	}
	
	@Test
	public void testSparseContributor() throws JsonProcessingException {
		SparseContributor sparseJoe = Utils.joeUser.asSparseContributor();
		assertEquals("joeUser", sparseJoe.getDisplayName());
		assertEquals(Utils.JoesUUID, sparseJoe.getId());
		assertEquals("joeUser@marklogic.com", sparseJoe.getUserName());
		
		String sparseToString = mapper.writeValueAsString(sparseJoe);
		assertFalse("Some text about a basic user", sparseToString.contains("Some text about"));
	}
}
