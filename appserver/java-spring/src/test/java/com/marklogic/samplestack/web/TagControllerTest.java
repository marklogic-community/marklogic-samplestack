package com.marklogic.samplestack.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.domain.UnitTests;

/**
 * Tests the service that returns candidate tags given a
 * substring to search for.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = { Application.class })
@Category(UnitTests.class)
public class TagControllerTest extends ControllerTests {

	@Test
	public void testTagsAnonymousOK() throws Exception {
		this.mockMvc.perform(
				get("/tags"))
				.andExpect(status().isOk());
	}
	
	@Test
	public void testTagsNoArgs() throws Exception {
		login("joeUser@marklogic.com", "joesPassword");
		askQuestion();
		this.mockMvc.perform(
				get("/tags"))
				.andExpect(status().isOk());
	}
	
	@Test
	public void testTagsWithArgument() throws Exception {
		this.mockMvc.perform(
				get("/tags?q=com"))
				.andExpect(status().isOk());
	}
}
