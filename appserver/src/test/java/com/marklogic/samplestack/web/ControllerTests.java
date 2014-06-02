package com.marklogic.samplestack.web;

import static org.hamcrest.Matchers.containsString;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Locale;

import javax.servlet.http.HttpSession;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.web.FilterChainProxy;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.Utils;
import com.marklogic.samplestack.domain.Contributor;

@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = { Application.class })
public class ControllerTests {

	private Logger logger = LoggerFactory.getLogger(ControllerTests.class);
	
	@Autowired
	private WebApplicationContext wac;

	@Autowired
	private FilterChainProxy springSecurityFilter;

	@Autowired
	private ObjectMapper mapper;
	
	private MockMvc mockMvc;
	

	@Before
	public void setup() {
		this.mockMvc = MockMvcBuilders.webAppContextSetup(this.wac).addFilter(this.springSecurityFilter, "/*").build();
	}
	
	private HttpSession login(String username, String password) throws Exception {
		HttpSession session = mockMvc.perform(post("/login").param("username",username ).param("password", password))
				.andExpect(status().is(HttpStatus.FOUND.value()))
				.andExpect(redirectedUrl("/"))
				.andReturn()
				.getRequest()
				.getSession();	
		return session;
	}
	
	private HttpSession logout() throws Exception {
		return this.mockMvc.perform(get("/logout")).andReturn()
		.getRequest()
		.getSession();
	}
	
	
	@Test
	public void testLogin() throws Exception {
		HttpSession session = mockMvc.perform(post("/login").param("username", "nobody" ).param("password", "nopassword"))
				.andExpect(status().is(HttpStatus.FOUND.value()))
				.andExpect(redirectedUrl("/login?error"))
				.andReturn()
				.getRequest()
				.getSession();	
		//(session);
		
		// another bad credential case
		session = mockMvc.perform(post("/login").param("username", "joeUser@marklogic.com" ).param("password", "notJoesPassword"))
				.andExpect(status().is(HttpStatus.FOUND.value()))
				.andExpect(redirectedUrl("/login?error"))
				.andReturn()
				.getRequest()
				.getSession();	
		//assertNull(session);
		
		session = login("joeUser@marklogic.com", "joesPassword");

		assertNotNull(session);	

		mockMvc.perform(get("/").session((MockHttpSession)session).locale(Locale.ENGLISH))
				.andDo(print())
				.andExpect(status().isOk());
		
		session = logout();
		mockMvc.perform(get("/").session((MockHttpSession)session).locale(Locale.ENGLISH))
		.andDo(print())
		.andExpect(status().is3xxRedirection());

	}


	@Test
	/**
	 * tests /foo/new POST,
	 * /foo POST,
	 * /foo/{1} PUT DELETE GET
	 */
	public void fooSlashIdLifecycle() throws Exception {
		HttpSession session = login("joeUser", "joesPassword");
		this.mockMvc
				.perform(get("/foo/new").accept(MediaType.APPLICATION_JSON))
				// .andExpect(content().string("blah"));
				.andExpect(status().isOk())
				.andExpect(
						content().contentType("application/json;charset=UTF-8"))
				.andExpect(jsonPath("name").value("name"));
		this.mockMvc
				.perform(
						post("/foo").session((MockHttpSession) session)
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
		
		// joe cannot delete
		this.mockMvc.perform(delete("/foo/1")).andExpect(status().is(302))
				.andExpect(content().string(""));
		
		session = login("maryAdmin", "marysPassword");
		this.mockMvc.perform(delete("/foo/1").session((MockHttpSession) session)).andExpect(status().is(204))
		.andExpect(content().string(""));

		this.mockMvc.perform(get("/foo/1").accept(MediaType.APPLICATION_JSON))
				.andExpect(status().isNotFound());
	}

	@Test
	/**
	 * tests /contributors POST
	 * /contributors GET
	 * /docs GET
	 */
	public void testContributorList() throws Exception {
		HttpSession session = login("joeUser@marklogic.com", "joesPassword");
		Contributor joeUser =  Utils.getBasicUser();
		this.mockMvc
				.perform(
						post("/contributors").session((MockHttpSession)session).locale(Locale.ENGLISH)
								.contentType(MediaType.APPLICATION_JSON)
								.content(mapper.writeValueAsString(joeUser)))
				.andExpect(status().isForbidden());

		session = login("maryAdmin@marklogic.com", "marysPassword");
		this.mockMvc
				.perform(
						post("/contributors").session((MockHttpSession) session).locale(Locale.ENGLISH)
								.contentType(MediaType.APPLICATION_JSON)
								.content(mapper.writeValueAsString(joeUser)))
				.andExpect(status().isCreated())
				.andReturn()
				.getResponse().getContentAsString().contains("joeUser@marklogic.com");

		String contributorsList = this.mockMvc.perform(get("/contributors?q=grechaw").session((MockHttpSession) session)
				).andReturn()
				.getResponse().getContentAsString();

		logger.info("contributors list" + contributorsList);
		assertTrue(contributorsList.contains("Some text about a basic user"));
		
		String getById = this.mockMvc.perform(get("/contributors/" + joeUser.getId())
				.session((MockHttpSession) session).locale(Locale.ENGLISH))
				.andExpect(status().isOk()).andReturn().getResponse()
				.getContentAsString();

		String getByDocURI = this.mockMvc
				.perform(get("/docs").param("docUri", "/contributors/" + joeUser.getId() + ".json")
						.session((MockHttpSession) session).locale(Locale.ENGLISH))
				.andExpect(status().isOk()).andReturn().getResponse()
				.getContentAsString();

		assertEquals("Document and ID crud should get same payload.", getById, getByDocURI);

		this.mockMvc.perform(
				delete("/foo/2"));

	}

	@Test
	public void testDocumentTags() throws Exception {
		// invalid JSON is 400
		this.mockMvc
				.perform(
						post("/tags")
								.contentType(MediaType.APPLICATION_JSON)
								.content(
										"{\"name\":\"name2\", \"id\":2, \"startDate\":\"2014-03-20T16:41:00.050+0000\", \"doubleValue\":0.221612619207606, \"point\":\"-14,-113\"}"))
				.andExpect(status().isBadRequest());
		// this.mockMvc
		// 		.perform(
		// 				post("/tags")
		// 						.contentType(MediaType.APPLICATION_JSON)
		// 						.content(
		// 								"{\"userName\":\"name2\", \"tagName\":\"testTag\", \"createdAt\":\"2014-03-20T16:41:00.050+0000\", \"conceptUri\":\"http://blah\"}"))
		// 		.andExpect(status().isCreated());

	}

	@Test
	public void testDefaultOptionsSearch() throws Exception {
		HttpSession session = login("maryAdmin", "marysPassword");
		this.mockMvc
				.perform(
						post("/foo").session((MockHttpSession) session)
								.contentType(MediaType.APPLICATION_JSON)
								.content(
										"{\"name\":\"word word words\", \"id\":15, \"startDate\":\"2014-03-20T16:41:00.050+0000\", \"doubleValue\":0.221612619207606, \"point\":\"-14,-113\"}"))
				.andExpect(status().isCreated());
		this.mockMvc
				.perform(
						get("/foo/search").contentType(
								MediaType.APPLICATION_JSON).param("q", "word"))
				.andExpect(status().isOk())
				// .andExpect(content().contentType(MediaType.APPLICATION_JSON))
				// match has charset
				.andExpect(content().string(containsString("word")));
		this.mockMvc.perform(delete("/foo/15"));
	}

	
}
