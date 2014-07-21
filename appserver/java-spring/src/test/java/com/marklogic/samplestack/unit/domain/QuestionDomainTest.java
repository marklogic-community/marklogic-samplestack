package com.marklogic.samplestack.unit.domain;

import static org.junit.Assert.assertEquals;

import java.util.ArrayList;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.marklogic.samplestack.domain.Answer;
import com.marklogic.samplestack.domain.Comment;
import com.marklogic.samplestack.domain.InitialQuestion;
import com.marklogic.samplestack.impl.CustomObjectMapper;
import com.marklogic.samplestack.testing.UnitTests;
import com.marklogic.samplestack.testing.Utils;

@Category(UnitTests.class)
public class QuestionDomainTest {

	private CustomObjectMapper mapper;
	
	@Before
	public void setUp() {
		mapper = new CustomObjectMapper();
	}
	
	@Test
	public void testInitialQuestion() throws JsonProcessingException {
		InitialQuestion initialQuestion;
		initialQuestion = new InitialQuestion();
		initialQuestion.setText("text");
		initialQuestion.setTitle("title");
		initialQuestion.setTags(new String[] {"tag1", "tag2"});
		// initialQuestion.setOwner(Utils.joeUser.asSparseContributor());
		
		assertEquals("JSON of initial question", "{\"title\":\"title\",\"text\":\"text\",\"tags\":[\"tag1\",\"tag2\"],\"owner\":null}", mapper.writeValueAsString(initialQuestion));
	}


	@Test
	public void testAnswer() throws JsonProcessingException {
		Answer answer = new Answer();
		answer.setId("/answers/"+134);
		answer.setText("text");
		answer.setComments(new ArrayList<Comment>());
		answer.setItemTally(0);
		answer.setOwner(Utils.joeUser.asSparseContributor());
		assertEquals("JSON of answer", "{\"id\":\"/answers/134\",\"text\":\"text\",\"itemTally\":0,\"comments\":[],\"owner\":{\"displayName\":\"joeUser\",\"userName\":\"joeUser@marklogic.com\"}}", mapper.writeValueAsString(answer));
	}
	
	@Test
	public void testComment() throws JsonProcessingException {
		Comment comment  = new Comment();
		comment.setText("Comment Text");
		comment.setOwner(Utils.joeUser.asSparseContributor());
		assertEquals("JSON of comment", "{\"owner\":{\"displayName\":\"joeUser\",\"userName\":\"joeUser@marklogic.com\"},\"text\":\"Comment Text\",\"creationDate\":null}", mapper.writeValueAsString(comment));
	}
}
