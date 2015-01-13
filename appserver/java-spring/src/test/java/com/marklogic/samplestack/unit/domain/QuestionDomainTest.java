/*
 * Copyright 2012-2015 MarkLogic Corporation
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

import java.util.ArrayList;
import java.util.Date;

import org.json.JSONException;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.skyscreamer.jsonassert.JSONAssert;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.marklogic.samplestack.SamplestackConstants.ISO8601Formatter;
import com.marklogic.samplestack.dbclient.CustomObjectMapper;
import com.marklogic.samplestack.domain.Answer;
import com.marklogic.samplestack.domain.Comment;
import com.marklogic.samplestack.domain.InitialQuestion;
import com.marklogic.samplestack.testing.UnitTests;
import com.marklogic.samplestack.testing.Utils;

@Category(UnitTests.class)
public class QuestionDomainTest {

	private CustomObjectMapper mapper = new CustomObjectMapper();
	
	@Test
	public void testInitialQuestion() throws JsonProcessingException, JSONException {
		InitialQuestion initialQuestion;
		initialQuestion = new InitialQuestion();
		initialQuestion.setText("text");
		initialQuestion.setTitle("title");
		initialQuestion.setTags(new String[] {"tag1", "tag2"});
		initialQuestion.setOwner(Utils.testC1.asSparseContributor());
		String expected ="{answers:[],comments:[],acceptedAnswerId:null,accepted:false,creationDate:null,id:null,voteCount:0,itemTally:0,lastActivityDate:null,owner:{id:\"cf99542d-f024-4478-a6dc-7e723a51b041\",displayName:\"testC1\",userName:\"testC1@example.com\"},tags:[\"tag1\",\"tag2\"],text:\"text\",title:\"title\"}";
		
		JSONAssert.assertEquals(expected, mapper.writeValueAsString(initialQuestion),
				false);
	}


	@Test
	public void testAnswer() throws JsonProcessingException, JSONException {
		Answer answer = new Answer();
		answer.setId("/answers/"+134);
		answer.setText("text");
		answer.setComments(new ArrayList<Comment>());
		answer.setItemTally(0);
		answer.setOwner(Utils.testC1.asSparseContributor());
		Date now = new Date();
		answer.setCreationDate(now);
		String expected = "{creationDate:\""+ ISO8601Formatter.format(now) + "\",id:\"/answers/134\",text:\"text\",itemTally:0,comments:[],owner:{displayName:\"testC1\",userName:\"testC1@example.com\"}}";
		JSONAssert.assertEquals(expected, mapper.writeValueAsString(answer), false);
	}
	
	@Test
	public void testComment() throws JsonProcessingException, JSONException {
		Comment comment  = new Comment();
		comment.setText("Comment Text");
		comment.setOwner(Utils.testC1.asSparseContributor());
		Date now = new Date();
		comment.setCreationDate(now);
		String expected = "{creationDate:\""+ ISO8601Formatter.format(now) +"\",text:\"Comment Text\",owner:{id:\"cf99542d-f024-4478-a6dc-7e723a51b041\",displayName:\"testC1\",userName:\"testC1@example.com\"}}";
		JSONAssert.assertEquals(expected, mapper.writeValueAsString(comment), false);
	}
}
