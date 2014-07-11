package com.marklogic.samplestack.testing;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.mock.web.MockHttpSession;

public class TagControllerTestImpl extends ControllerTests {
	
	
	public void testTagsAnonymousOK() throws Exception {
		this.mockMvc.perform(
				get("/tags"))
				.andExpect(status().isOk());
	}
	
	public void testTagsNoArgs() throws Exception {
		login("joeUser@marklogic.com", "joesPassword");
		this.mockMvc.perform(
				get("/tags").session((MockHttpSession) session))
				.andExpect(status().isOk());
	}
	
	public void testTagsWithArgument() throws Exception {
		this.mockMvc.perform(
				get("/tags?q=com"))
				.andExpect(status().isOk());
	}
}
