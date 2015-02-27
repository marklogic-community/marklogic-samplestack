/*
 * Copyright 2012-2015 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/
package com.marklogic.samplestack.integration.web;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MvcResult;

import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.dbclient.Clients;
import com.marklogic.samplestack.testing.IntegrationTests;
import com.marklogic.samplestack.testing.TagControllerTestImpl;
import com.marklogic.samplestack.testing.TestDataManager;

/**
 * Tests the service that returns candidate tags given a
 * substring to search for.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@SpringApplicationConfiguration(classes = { Application.class, TestDataManager.class })
@Category(IntegrationTests.class)
public class TagControllerIT extends TagControllerTestImpl {

	@Autowired
	private Clients clients;

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

	@Test
	public void testBadSort() throws Exception {
		super.testBadSort();
	}

	@Test
    public void testTagsWithPageLength() throws Exception {
        super.testTagsWithPageLength();
    }

	@Test
    public void testStartLimitOrder() throws Exception {
        super.testStartLimitOrder();
    }

	@Test
    public void testSortFrequency() throws Exception {
		super.testLoggedInSortFrequency();
    }

	@Test
	/*
	 * This test is exposed to the seed data.
	 * The counts in related tags extension do a fully-scoped
	 * search, without test-data-tag as a criterion.
	 * TODO, instrument extension to be more robust with test.
	 * Workaround here is to test with start=2, because
	 * that skips the data point that varies.
	 */
    public void testRelatedTags() throws Exception {
        MvcResult result = super.testRelatedTagsNoArgs();
        logger.debug( result.getResponse().getContentAsString());
        JSONAssert.assertEquals("{values-response:{distinct-value:[{frequency:1,_value:\"latex\"},{frequency:1,_value:\"pango\"},{frequency:2,_value:\"test-data-tag\"}]}}" , result.getResponse().getContentAsString(), false);

		result = super.testRelatedTagsStartPageLength();

		logger.debug(result.getResponse().getContentAsString());
		 JSONAssert.assertEquals("{values-response:{distinct-value:[{frequency:1,_value:\"latex\"}] }}"
					, result.getResponse().getContentAsString(), false);

	}
}
