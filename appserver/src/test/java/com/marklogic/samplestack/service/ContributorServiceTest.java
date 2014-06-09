package com.marklogic.samplestack.service;

import static org.junit.Assert.assertEquals;

import java.util.List;
import java.util.UUID;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.IntegrationTest;
import com.marklogic.samplestack.Utils;
import com.marklogic.samplestack.domain.Contributor;

@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = { Application.class })
@Category(IntegrationTest.class)
public class ContributorServiceTest extends MarkLogicIntegrationTest {

	private final Logger logger = LoggerFactory
			.getLogger(ContributorServiceTest.class);
	
	
	UUID id1 = null;

	private Contributor getContributor() {
		Contributor contributor = new Contributor();
		contributor.setAboutMe("Some text about me");
		id1 = UUID.randomUUID();
		contributor.setId(id1);
		contributor.setDisplayName("grechaw");
		contributor.setWebsiteUrl("http://website.com/grechaw");
		return contributor;
	}

	@Before
	public void cleanout() {
		operations.deleteDirectory("/contributors/");
	}

	@Test
	public void testContributorCRUD() throws JsonProcessingException {
		
		Contributor c1 = getContributor();
		contributorService.store(c1);

		Contributor c2 = contributorService.get(c1.getId());

		logger.debug(mapper.writeValueAsString(c2));

		Utils.compareContributors("Compare simple store and retrieve", c1, c2);

		List<Contributor> contributorList = contributorService
				.search("grechaw");
		assertEquals("Retrieved one conributor", 1, contributorList.size());

		contributorList = contributorService.list(1);
		assertEquals("Retrieved one conributor", 1, contributorList.size());
		contributorList = contributorService.list(2);
		assertEquals("Retrieved one conributor", 0, contributorList.size());

		
		contributorService.delete(c1.getId());

		contributorList = contributorService.list(1);
		assertEquals("Retrieved one conributor", 0, contributorList.size());
		
	}
	
	@Test
	public void testVoting() {
		
	}

}
