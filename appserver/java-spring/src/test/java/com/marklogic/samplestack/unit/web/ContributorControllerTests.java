package com.marklogic.samplestack.unit.web;

import groovy.lang.Category;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.samplestack.mock.MockApplication;
import com.marklogic.samplestack.testing.ContributorControllerTestImpl;
import com.marklogic.samplestack.testing.UnitTests;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@SpringApplicationConfiguration(classes = { MockApplication.class })
@Category(UnitTests.class)
public class ContributorControllerTests extends ContributorControllerTestImpl {
	
	@Test
	public void testLogin() throws Exception {
		super.testLogin();
	}

	@Test
	/**
	 * tests /contributors POST
	 * /contributors GET
	 * /docs GET
	 */
	public void testContributorCRUD() throws Exception {
		super.testContributorCRUD();
	}
	
}
