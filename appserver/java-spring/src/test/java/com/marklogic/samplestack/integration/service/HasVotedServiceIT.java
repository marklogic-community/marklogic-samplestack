package com.marklogic.samplestack.integration.service;

import static org.junit.Assert.assertEquals;

import java.util.Map;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.marklogic.samplestack.dbclient.DatabaseContext;
import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.service.HasVotedService;
import com.marklogic.samplestack.testing.IntegrationTests;
import com.marklogic.samplestack.testing.TestDataManager;
import com.marklogic.samplestack.testing.Utils;


@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = { DatabaseContext.class, TestDataManager.class })
@Category(IntegrationTests.class)
public class HasVotedServiceIT  extends MarkLogicIntegrationIT {

	@Autowired
	private	HasVotedService service;
	
	@Autowired
	private TestDataManager testDataManager;
	
	
	@Test
	public void testHasVoted() {

		Map<String, Integer> votedIds = service.hasVoted(ClientRole.SAMPLESTACK_CONTRIBUTOR, Utils.testC1.getId(), testDataManager.testC1AnswerIds.get(0));
		assertEquals("Votes that joe has made on mary's question", 1, votedIds.size());
		
		String voteId = votedIds.keySet().iterator().next();
		assertEquals(voteId, testDataManager.testA1QuestionIds.get(0));
	}
}
