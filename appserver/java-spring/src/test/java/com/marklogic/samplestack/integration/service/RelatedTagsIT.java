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

import org.json.JSONException;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.skyscreamer.jsonassert.JSONAssert;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
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

	@Autowired
	private ObjectMapper mapper;

	@Test
	@Ignore
	// because the results are different with data loaded.
	public void testRelatedTags() throws JsonProcessingException, JSONException {

		ObjectNode relatedTagsResponse = manager.getRelatedTags("tex");

		logger.info(mapper.writeValueAsString(relatedTagsResponse));
		JSONAssert.assertEquals("{reltags:[\"ada\",\"braille\",\"capitalization\",\"cleartype\",\"context\",\"cutepdf\",\"directwrite\",\"freetype\",\"harfbuzz\",\"knitr\",\"latex\",\"lyx\",\"mix\",\"mmix\",\"metapost\",\"miktex\",\"opentype\",\"pstricks\",\"pango\",\"pdftex\",\"postscript\",\"sweave\",\"tex4ht\",\"termcap\",\"test-data-tag\",\"texinfo\",\"truetype\",\"typeface\",\"typekit\",\"typesetting\",\"uniscribe\",\"web\",\"xetex\"]}",
				mapper.writeValueAsString(relatedTagsResponse), true);
		relatedTagsResponse = manager.getRelatedTags("latex");
		logger.info(mapper.writeValueAsString(relatedTagsResponse));

		JSONAssert.assertEquals("{reltags:[\"clay\",\"context\",\"concrete\",\"figlet\",\"fxml\",\"fiber\",\"freetype\",\"gemstone\",\"glass\",\"itext\",\"knitr\",\"mxml\",\"material\",\"metapost\",\"miktex\",\"pstricks\",\"pdftex\",\"putty\",\"sweave\",\"tar\",\"tex\",\"terracotta\",\"texinfo\",\"troff\",\"xbl\",\"xetex\"]}", mapper.writeValueAsString(relatedTagsResponse), true);
	}
}
