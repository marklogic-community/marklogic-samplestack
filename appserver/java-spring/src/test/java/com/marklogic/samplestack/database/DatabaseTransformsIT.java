/*
 * Copyright 2012-2014 MarkLogic Corporation
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
package com.marklogic.samplestack.database;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.marklogic.samplestack.dbclient.DatabaseContext;
import com.marklogic.samplestack.integration.service.MarkLogicIntegrationIT;
import com.marklogic.samplestack.service.ContributorService;
import com.marklogic.samplestack.testing.DatabaseExtensionTests;

/**
 * Tests the transforms installed in the db-config/transforms directory upon
 * which samplestack depends.
 * 
 * The transforms were all refactored out so this test is empty.
 * 
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = DatabaseContext.class)
@Category(DatabaseExtensionTests.class)
public class DatabaseTransformsIT extends MarkLogicIntegrationIT {

	@Autowired
	private ContributorService contributorService;

	@Ignore
	@Test
	public void noTransformsToTest() {
	
	}

}