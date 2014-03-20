package com.marklogic.sasquatch;

import static org.junit.Assert.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = { SasquatchWebConfiguration.class,
		SasquatchConfiguration.class })
public class SasquatchTests {

	@Autowired
	private WebApplicationContext wac;

	private MockMvc mockMvc;

	@Before
	public void setup() {
		this.mockMvc = MockMvcBuilders.webAppContextSetup(this.wac).build();
	}

	@Test
	public void fooLifecycle() throws Exception {

		this.mockMvc
				.perform(get("/foo").accept(MediaType.APPLICATION_JSON))
				// .andExpect(content().string("blah"));
				.andExpect(status().isOk())
				.andExpect(
						content().contentType("application/json;charset=UTF-8"))
				.andExpect(jsonPath("name").value("name"));
		this.mockMvc
				.perform(
						post("/foo")
								.contentType(MediaType.APPLICATION_JSON)
								.content(
										"{\"name\":\"name1\", \"id\":1, \"startDate\":1395333660050, \"doubleValue\":0.221612619207606, \"point\":\"-14,-113\"}"))
				.andExpect(status().isCreated());
		this.mockMvc
				.perform(get("/foo/1").accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isOk())
				.andExpect(
						content().contentType("application/json;charset=UTF-8"))
				.andExpect(jsonPath("name").value("name1"));
		this.mockMvc.perform(delete("/foo/1")).andExpect(status().is(204))
				.andExpect(content().string(""));
		this.mockMvc.perform(get("/foo/1").accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound());
	}

	@Test
	public void testHateOS() throws Exception {
		// put a couple foos up.
		this.mockMvc
				.perform(
						post("/foo")
								.contentType(MediaType.APPLICATION_JSON)
								.content(
										"{\"name\":\"name1\", \"id\":1, \"startDate\":1395333660050, \"doubleValue\":0.221612619207606, \"point\":\"-14,-113\"}"))
				.andExpect(status().isCreated());

		this.mockMvc
				.perform(
						post("/foo")
								.contentType(MediaType.APPLICATION_JSON)
								.content(
										"{\"name\":\"name2\", \"id\":2, \"startDate\":1395333660050, \"doubleValue\":0.221612619207606, \"point\":\"-14,-113\"}"))
				.andExpect(status().isCreated());
		
		String fooList = this.mockMvc.perform(get("/foo")).andReturn().getResponse().getContentAsString();
		
		System.out.println(fooList);
		assertTrue(fooList.contains("/foo/1") && fooList.contains("/foo/2"));
		
	}
}
