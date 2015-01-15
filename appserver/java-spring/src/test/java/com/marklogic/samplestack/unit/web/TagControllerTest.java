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
 * Unit tests for TagController
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
	public void testRelatedTags() throws Exception {
		super.testRelatedTagsNoArgs();
		super.testRelatedTagsStartPageLength();
	}
}
