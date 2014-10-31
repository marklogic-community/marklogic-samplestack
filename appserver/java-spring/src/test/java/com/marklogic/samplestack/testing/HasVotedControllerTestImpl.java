package com.marklogic.samplestack.testing;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.springframework.mock.web.MockHttpSession;

public class HasVotedControllerTestImpl extends ControllerTests {

	
	public void testHasVoted() throws Exception {
		
		this.mockMvc.perform(get("/hasVoted"))
				.andExpect(status().isBadRequest());
		
		this.mockMvc.perform(get("/hasVoted")
				.param("contributorId", "1"))
				.andExpect(status().isBadRequest());
		
		this.mockMvc.perform(get("/hasVoted")
				.param("contributorId", "1")
				.param("questionId", "1"))
				.andExpect(status().isOk());
		
		login("joeUser@marklogic.com", "joesPassword");
		this.mockMvc.perform(get("/hasVoted")
				.param("contributorId", "1")
				.param("questionId", "1")
				.session((MockHttpSession) session))
				.andExpect(status().isOk());
	}

}
