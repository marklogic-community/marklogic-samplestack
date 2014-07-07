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
