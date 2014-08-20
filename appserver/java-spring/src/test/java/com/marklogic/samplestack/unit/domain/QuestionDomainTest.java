package com.marklogic.samplestack.unit.domain;

import static com.marklogic.samplestack.SamplestackConstants.ISO8601Formatter;

import java.util.ArrayList;
import java.util.Date;

import org.json.JSONException;
import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.skyscreamer.jsonassert.JSONAssert;

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
	public void testInitialQuestion() throws JsonProcessingException, JSONException {
		InitialQuestion initialQuestion;
		initialQuestion = new InitialQuestion();
		initialQuestion.setText("text");
		initialQuestion.setTitle("title");
		initialQuestion.setTags(new String[] {"tag1", "tag2"});
		initialQuestion.setOwner(Utils.joeUser.asSparseContributor());
		String expected ="{answers:[],comments:[],creationDate:null,id:null,docScore:0,itemTally:0,lastActivityDate:null,owner:{id:\"cf99542d-f024-4478-a6dc-7e723a51b040\",displayName:\"joeUser\",userName:\"joeUser@marklogic.com\"},tags:[\"tag1\",\"tag2\"],text:\"text\",title:\"title\"}";
		
		JSONAssert.assertEquals(mapper.writeValueAsString(initialQuestion),
				expected, false);
	}


	@Test
	public void testAnswer() throws JsonProcessingException, JSONException {
		Answer answer = new Answer();
		answer.setId("/answers/"+134);
		answer.setText("text");
		answer.setComments(new ArrayList<Comment>());
		answer.setItemTally(0);
		answer.setOwner(Utils.joeUser.asSparseContributor());
		Date now = new Date();
		answer.setCreationDate(now);
		String expected = "{creationDate:\""+ ISO8601Formatter.format(now) + "\",id:\"/answers/134\",text:\"text\",itemTally:0,comments:[],owner:{displayName:\"joeUser\",userName:\"joeUser@marklogic.com\"}}";
		JSONAssert.assertEquals(expected, mapper.writeValueAsString(answer), false);
	}
	
	@Test
	public void testComment() throws JsonProcessingException, JSONException {
		Comment comment  = new Comment();
		comment.setText("Comment Text");
		comment.setOwner(Utils.joeUser.asSparseContributor());
		Date now = new Date();
		comment.setCreationDate(now);
		String expected = "{creationDate:\""+ ISO8601Formatter.format(now) +"\",text:\"Comment Text\",owner:{id:\"cf99542d-f024-4478-a6dc-7e723a51b040\",displayName:\"joeUser\",userName:\"joeUser@marklogic.com\"}}";
		JSONAssert.assertEquals(expected, mapper.writeValueAsString(comment), false);
	}
}
