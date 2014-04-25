package com.marklogic.sampleStack.service;

import java.util.Date;

import org.junit.Test;
import org.junit.runner.RunWith;
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
		user.setAccountId("account01");
		user.setCreationDate(new Date());
		user.setDisplayName("grechaw");
		user.setLastAccessDate(new Date());
		user.setDownVotes(10L);
		user.setUpVotes(1L);
		user.setViews(10L);
		user.setWebsiteUrl("http://website.com/grechaw");
		return user;
	}
	@Test
	public void testUserCRUD() {
		User u1 = getUser();
		userService.store(u1);
	}
		
}
