package com.marklogic.samplestack.integration.web;

import groovy.lang.Category;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.service.ContributorService;
import com.marklogic.samplestack.testing.LoginTestsImpl;
import com.marklogic.samplestack.testing.UnitTests;
import com.marklogic.samplestack.testing.Utils;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@SpringApplicationConfiguration(classes = { Application.class })
@Category(UnitTests.class)
public class LoginTest extends LoginTestsImpl {

	@Autowired
	private ContributorService contributorService;
	
	@Before
	public void setupJoe() {
		contributorService.store(Utils.joeUser);
	}
	
	@Test
	public void loginBadCredentials() throws Exception {
		super.loginBadCredentials();
	}
	
	@Test
	public void loginNormalFlow() throws Exception {
		super.loginNormalFlow();
	}
	
	@Test
	public void loginForbidden() throws Exception {
		super.loginForbidden();
	}
}
