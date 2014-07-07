package com.marklogic.samplestack.unit.domain;

import static org.junit.Assert.assertEquals;

import java.io.IOException;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.springframework.core.io.ClassPathResource;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.impl.CustomObjectMapper;
import com.marklogic.samplestack.testing.UnitTests;

@Category(UnitTests.class)
public class ContributorTest {

	Contributor joe, mary;
	ObjectMapper mapper =  new CustomObjectMapper();
	
	@Before
	public void initFS() throws JsonParseException, JsonMappingException, IOException {
		ClassPathResource contributorResource = new ClassPathResource("contributor/joeUser.json");
		joe = mapper.readValue(contributorResource.getFile(), Contributor.class);
		contributorResource = new ClassPathResource("contributor/maryAdmin.json");
		mary = mapper.readValue(contributorResource.getFile(), Contributor.class);	
	}
	
	@Test
	public void testTheTestJson() {
		assertEquals("Joe User", joe.getDisplayName());
		
		// TODO more assertions
		
	}
}
