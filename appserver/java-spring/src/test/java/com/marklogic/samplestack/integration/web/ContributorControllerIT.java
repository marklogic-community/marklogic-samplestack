package com.marklogic.samplestack.integration.web;


import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.testing.ContributorControllerTestImpl;
import com.marklogic.samplestack.testing.IntegrationTests;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@SpringApplicationConfiguration(classes = { Application.class })
@Category(IntegrationTests.class)
public class ContributorControllerIT extends ContributorControllerTestImpl {

	@Test
	public void testLogin() throws Exception {
		super.testLogin();
	}

	@Test
	/**
	 * tests /contributors POST
	 * /contributors GET
	 */
	public void testContributorCRUD() throws Exception {
		super.testContributorCRUD();
	}
	
}
