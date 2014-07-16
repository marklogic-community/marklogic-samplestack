/*
 * Copyright 2012-2014 MarkLogic Corporation
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
package com.marklogic.samplestack.integration.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.junit.After;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.marklogic.client.impl.StringQueryDefinitionImpl;
import com.marklogic.client.pojo.PojoPage;
import com.marklogic.client.query.StringQueryDefinition;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.exception.SampleStackDataIntegrityException;
import com.marklogic.samplestack.impl.DatabaseContext;
import com.marklogic.samplestack.testing.IntegrationTests;
import com.marklogic.samplestack.testing.Utils;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = { DatabaseContext.class })
@Category(IntegrationTests.class)
public class ContributorServiceIT extends MarkLogicIntegrationIT {

	private final Logger logger = LoggerFactory
			.getLogger(ContributorServiceIT.class);
	
	
	String id1 = null;

	private Contributor getContributor() {
		Contributor contributor = new Contributor();
		contributor.setAboutMe("Some text about me");
		id1 = UUID.randomUUID().toString();
		contributor.setId(id1);
		contributor.setUserName("grechaw@marklogic.com");
		contributor.setDisplayName("grechaw");
		contributor.setWebsiteUrl("http://website.com/grechaw");
		Set<String> votes =  new HashSet<String>();
		votes.add("/questions/1");
		votes.add("/answers/123");
		contributor.setVotes(votes);
		return contributor;
	}

	@After
	public void cleanout() {
		contributorService.deleteAll();
	}

	@Test
	public void testContributorCRUD() throws JsonProcessingException {
		
		Contributor c1 = getContributor();
		contributorService.write(c1);

		Contributor c2 = contributorService.read(c1.getId());

		logger.debug(mapper.writeValueAsString(c2));

		Utils.compareContributors("Compare simple store and retrieve", c1, c2);

		StringQueryDefinition qdef = new StringQueryDefinitionImpl("contributors");
		qdef.setCriteria("grechaw@marklogic.com");
		Contributor contributor = contributorService.search(qdef, 1).iterator().next();
		assertEquals("Retrieved one conributor", "grechaw@marklogic.com", contributor.getUserName());

		PojoPage<Contributor> contributorPage = contributorService.readAll(1);
		assertEquals("Retrieved one conributor", 1, contributorPage.size());
		contributorPage = contributorService.readAll(2);
		assertEquals("Retrieved one conributor", 0, contributorPage.size());

		
		contributorService.delete(c1.getId());

		contributorPage = contributorService.readAll(1);
		assertEquals("Retrieved one conributor after delete", 0, contributorPage.size());
		
	}
	
	@Test(expected=SampleStackDataIntegrityException.class)
	public void testUserNameCardinality() {
		Contributor c1 = getContributor();
		contributorService.write(c1);

		c1.setId(UUID.randomUUID().toString());
		contributorService.write(c1);
		fail("Updated ID of a contributor");
		
	}
}
