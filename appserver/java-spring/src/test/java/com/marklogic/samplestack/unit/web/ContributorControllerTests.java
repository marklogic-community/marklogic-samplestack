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
/**
 * Unit tests for ContributorController
 */
public class ContributorControllerTests extends ContributorControllerTestImpl {
	
	
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
