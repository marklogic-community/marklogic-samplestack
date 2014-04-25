package com.marklogic.sampleStack.service;

import java.util.Date;

import org.junit.Test;
import org.junit.runner.RunWith;
import static org.junit.Assert.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.sampleStack.Application;
import com.marklogic.sampleStack.domain.User;

@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = {Application.class })
public class UserServiceTest {

	@Autowired
	UserService userService;
	
	private User getUser() {
		User user = new User();
		user.setAboutMe("Some text about me");
		user.setId("1");
		user.setDisplayName("grechaw");
		user.setLastAccessDate(new Date());
		user.setDownVotes(10L);
		user.setUpVotes(1L);
		user.setViews(10L);
		user.setWebsiteUrl("http://website.com/grechaw");
		return user;
	}
	
	private void compareUsers(String message, User u1, User u2) {
		assertEquals(message, u1.getAboutMe(), u2.getAboutMe());
        assertEquals(message, u1.getId(), u2.getId());
        if (u1.getCreationDate() != null) {
        	assertEquals(message, u1.getCreationDate(), u2.getCreationDate());
        }
        assertEquals(message, u1.getDisplayName(), u2.getDisplayName());
        if (u1.getLastAccessDate() != null) {
        	assertNotEquals(message, u1.getLastAccessDate(), u2.getLastAccessDate());
        }
        assertEquals(message, u1.getDownVotes(), u2.getDownVotes());
        assertEquals(message, u1.getUpVotes(), u2.getUpVotes());
        assertEquals(message, u1.getViews(), u2.getViews());
        assertEquals(message, u1.getWebsiteUrl(), u2.getWebsiteUrl());
	}
	
	@Test
	public void testUserCRUD() {
		User u1 = getUser();
		userService.store(u1);
		
		User u2 = userService.get(u1.getId());
		compareUsers("Compare simple store and retrieve", u1, u2);
	}
		
}
