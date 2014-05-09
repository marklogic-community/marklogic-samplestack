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
public class UserServiceTest {

	@Autowired
	ContributorService contributorService;

	private Contributor getUser() {
		Contributor user = new Contributor();
		user.setAboutMe("Some text about me");
		user.setId("1");
		user.setDisplayName("grechaw");
		user.setWebsiteUrl("http://website.com/grechaw");
		return user;
	}

	private void compareUsers(String message, Contributor u1, Contributor u2) {
		assertEquals(message, u1.getAboutMe(), u2.getAboutMe());
		assertEquals(message, u1.getId(), u2.getId());
		assertEquals(message, u1.getDisplayName(), u2.getDisplayName());
		assertEquals(message, u1.getWebsiteUrl(), u2.getWebsiteUrl());
	}

	@Test
	public void testUserCRUD() {
		Contributor u1 = getUser();
		contributorService.store(u1);
		
		Contributor u2 = contributorService.get(u1.getId());
		compareUsers("Compare simple store and retrieve", u1, u2);
	}
}
