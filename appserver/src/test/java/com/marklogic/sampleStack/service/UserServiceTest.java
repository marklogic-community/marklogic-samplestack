package com.marklogic.sampleStack.service;

import java.util.Date;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.sampleStack.Application;
import com.marklogic.sampleStack.Utils;
import com.marklogic.sampleStack.domain.ApplicationUser;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = {Application.class })
public class UserServiceTest {

	@Autowired
	UserService userService;
	
	@Test
	public void testUserCRUD() {
		ApplicationUser u1 = Utils.getBasicUser();
		userService.store(u1);
	}
		
}
