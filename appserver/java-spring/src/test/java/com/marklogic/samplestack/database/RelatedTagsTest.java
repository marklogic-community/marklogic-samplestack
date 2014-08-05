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

import static org.junit.Assert.fail;

import java.util.List;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.marklogic.samplestack.impl.DatabaseContext;
import com.marklogic.samplestack.impl.RelatedTagsManager;
import com.marklogic.samplestack.testing.DatabaseExtensionTests;


@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = DatabaseContext.class)
@Category(DatabaseExtensionTests.class)
/**
 * Tests the semantic extension for related tags. (EA-3 deliverable)
 */
public class RelatedTagsTest {


	private final Logger logger = LoggerFactory
			.getLogger(RelatedTagsTest.class);

	
	@Autowired
	RelatedTagsManager manager;
	
	@Test
	@Ignore
	public void testRelatedTags() {
		String startTag = "javascript";
		
		List<String> relatedTags = manager.getRelatedTags(startTag);
		
		logger.info("" + relatedTags);
		
		
		logger.info("" + manager.getRelatedTags("xquery"));
		
		fail("No assertions");
		
	}
}
