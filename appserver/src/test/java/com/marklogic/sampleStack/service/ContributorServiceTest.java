package com.marklogic.sampleStack.service;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;

import java.util.Date;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.sampleStack.Application;
import com.marklogic.sampleStack.domain.Contributor;

@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = { Application.class })
public class ContributorServiceTest {

	@Autowired
	ContributorService contributorService;

	private Contributor getContributor() {
		Contributor contributor = new Contributor();
		contributor.setAboutMe("Some text about me");
		contributor.setId(1L);
		contributor.setDisplayName("grechaw");
		contributor.setWebsiteUrl("http://website.com/grechaw");
		return contributor;
	}
	
	

	private void compareContributors(String message, Contributor c1, Contributor c2) {
		assertEquals(message, c1.getAboutMe(), c2.getAboutMe());
		assertEquals(message, c1.getId(), c2.getId());
		assertEquals(message, c1.getDisplayName(), c2.getDisplayName());
		assertEquals(message, c1.getWebsiteUrl(), c2.getWebsiteUrl());
	}

	@Test
	public void testContributorCRUD() {
		Contributor c1 = getContributor();
		contributorService.store(c1);
		
		Contributor c2 = contributorService.get(c1.getId());
		compareContributors("Compare simple store and retrieve", c1, c2);
	}
}
