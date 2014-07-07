package com.marklogic.samplestack.unit.web;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.samplestack.mock.MockApplication;
import com.marklogic.samplestack.testing.TagControllerTestImpl;
import com.marklogic.samplestack.testing.UnitTests;

/**
 * Tests the service that returns candidate tags given a
 * substring to search for.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = { MockApplication.class })
@Category(UnitTests.class)
public class TagControllerTest extends TagControllerTestImpl {

	@Test
	public void testTagsAnonymousOK() throws Exception {
		super.testTagsAnonymousOK();
	}
	
	@Test
	public void testTagsNoArgs() throws Exception {
		super.testTagsNoArgs();
	}
	
	@Test
	public void testTagsWithArgument() throws Exception {
		super.testTagsWithArgument();
	}
}
