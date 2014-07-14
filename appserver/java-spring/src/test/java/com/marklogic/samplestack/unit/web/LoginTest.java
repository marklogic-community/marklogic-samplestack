package com.marklogic.samplestack.unit.web;

import groovy.lang.Category;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.samplestack.mock.MockApplication;
import com.marklogic.samplestack.testing.LoginTestsImpl;
import com.marklogic.samplestack.testing.UnitTests;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@SpringApplicationConfiguration(classes = { MockApplication.class })
@Category(UnitTests.class)
public class LoginTest extends LoginTestsImpl {

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
