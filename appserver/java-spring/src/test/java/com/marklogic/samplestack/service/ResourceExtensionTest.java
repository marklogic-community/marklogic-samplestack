package com.marklogic.samplestack.service;

import static org.junit.Assert.assertNotNull;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.marklogic.samplestack.impl.DatabaseContext;
import com.marklogic.samplestack.impl.TestResourceManager;


@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {DatabaseContext.class })
public class ResourceExtensionTest {


	private final Logger logger = LoggerFactory
			.getLogger(ResourceExtensionTest.class);
	
	@Autowired
	TestResourceManager extManager;
	
	@Test
	@Ignore
	// this is failing, TODO submit bug or wait for js implementation
	public void testExtension() {
		assertNotNull(extManager.checkExecution());
		logger.info(extManager.checkExecution());
	}
}
