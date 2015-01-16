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
package com.marklogic.samplestack.integration.service;

import static org.junit.Assert.assertEquals;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.marklogic.samplestack.dbclient.DatabaseContext;
import com.marklogic.samplestack.dbclient.RelatedTagsManager;
import com.marklogic.samplestack.testing.DatabaseExtensionTests;
import com.marklogic.samplestack.testing.TestDataManager;


/**
 * Tests the semantic extension for related tags. 
 * This feature is expected to be delivered in a
 * revision of Samplestack after 8.0-1.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = { DatabaseContext.class, TestDataManager.class})
@Category(DatabaseExtensionTests.class)
public class RelatedTagsIT {

	private final Logger logger = LoggerFactory
			.getLogger(RelatedTagsIT.class);


	@Autowired
	RelatedTagsManager manager;
	
	@Test
	@Ignore
	public void testRelatedTags() {

		String relatedTagsQueryString = manager.getRelatedTags("tex");

		logger.info("" + relatedTagsQueryString);

		assertEquals("Expected related tags query for 'tex'", "tag:braille OR tag:capitalization OR tag:cleartype OR tag:context OR tag:cutepdf OR tag:directwrite OR tag:freetype OR tag:harfbuzz OR tag:knitr OR tag:latex OR tag:lyx OR tag:mix OR tag:mmix OR tag:metapost OR tag:miktex OR tag:opentype OR tag:pstricks OR tag:pango OR tag:pdftex OR tag:postscript OR tag:sweave OR tag:tex4ht OR tag:termcap OR tag:texinfo OR tag:truetype OR tag:typeface OR tag:typekit OR tag:typesetting OR tag:uniscribe OR tag:web OR tag:xetex",relatedTagsQueryString);
		
		relatedTagsQueryString = manager.getRelatedTags("latex");

		assertEquals("Expected related tags query for 'latex'", "tag:context OR tag:knitr OR tag:metapost OR tag:miktex OR tag:pstricks OR tag:pdftex OR tag:sweave OR tag:tex OR tag:texinfo OR tag:xetex", relatedTagsQueryString);
	}
}
