package com.marklogic.sasquatch.mvc;

import static org.junit.Assert.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.ContentResultMatchers.*;

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

import com.marklogic.sasquatch.Application;

@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = { Application.class })
public class ControllerTests {

	@Autowired
	private WebApplicationContext wac;

	private MockMvc mockMvc;

	@Before
	public void setup() {
		this.mockMvc = MockMvcBuilders.webAppContextSetup(this.wac).build();
	}

	@Test
	/**
	 * tests /foo/new POST, 
	 * /foo POST, 
	 * /foo/{1} PUT DELETE GET
	 */
	public void fooSlashIdLifecycle() throws Exception {

		this.mockMvc
				.perform(get("/foo/new").accept(MediaType.APPLICATION_JSON))
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
	/**
	 * tests /foo POST
	 * /foo GET
	 * /docs GET
	 */
	public void testFooList() throws Exception {
		// put a couple foos up.
		this.mockMvc
				.perform(
						post("/foo")
								.contentType(MediaType.APPLICATION_JSON)
								.content(
										"{\"name\":\"name1\", \"id\":1, \"startDate\":\"2014-03-20T16:41:00.050+0000\", \"doubleValue\":0.221612619207606, \"point\":\"-14,-113\"}"))
				.andExpect(status().isCreated());

		this.mockMvc
				.perform(
						post("/foo")
								.contentType(MediaType.APPLICATION_JSON)
								.content(
										"{\"name\":\"name2\", \"id\":2, \"startDate\":\"2014-03-20T16:41:00.050+0000\", \"doubleValue\":0.221612619207606, \"point\":\"-14,-113\"}"))
				.andExpect(status().isCreated());
		
		String fooList = this.mockMvc.perform(get("/foo")).andReturn().getResponse().getContentAsString();
		
		System.out.println(fooList);
		assertTrue(fooList.contains("/foo/1") && fooList.contains("/foo/2"));

		String byBean = this.mockMvc
			.perform(
					get("/foo/1"))
					.andExpect(status().isOk())
					.andReturn().getResponse().getContentAsString();
		
		String byDoc = this.mockMvc
			.perform(
					get("/docs").param("docUri",  "/foo/1"))
					.andExpect(status().isOk())
					.andReturn().getResponse().getContentAsString();
		
		System.out.println(byBean);
		System.out.println(byDoc);
	}
	
	@Test
	public void testGithubTagging() throws Exception {
		// invalid JSON is 400
		this.mockMvc
			.perform(post("/tags")
					.contentType(MediaType.APPLICATION_JSON)
					.content(
							"{\"name\":\"name2\", \"id\":2, \"startDate\":\"2014-03-20T16:41:00.050+0000\", \"doubleValue\":0.221612619207606, \"point\":\"-14,-113\"}"))
							.andExpect(status().isBadRequest());
		this.mockMvc
		.perform(post("/tags")
				.contentType(MediaType.APPLICATION_JSON)
				.content(
						"{\"userName\":\"name2\", \"tagName\":\"testTag\", \"createdAt\":\"2014-03-20T16:41:00.050+0000\", \"conceptUri\":\"http://blah\"}"))
						.andExpect(status().isCreated());

	}
	
	@Test
	public void testDefaultOptionsSearch() throws Exception {
		this.mockMvc
			.perform(get("/foo/search")
						.contentType(MediaType.APPLICATION_JSON)
						.content("word"))
						.andExpect(status().isOk())
						.andExpect(content().contentType(MediaType.APPLICATION_JSON))
						.andExpect(content().string("chacka"));
						
	}
	
}
