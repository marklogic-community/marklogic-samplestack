package com.marklogic.samplestack.service;

import static org.junit.Assert.*;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.impl.TestResourceManager;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = {Application.class })
public class ResourceExtensionTest {


	private final Logger logger = LoggerFactory
			.getLogger(ResourceExtensionTest.class);
	
	@Autowired
	TestResourceManager extManager;
	
	@Test
	public void testExtension() {
		assertNotNull(extManager.checkExecution());
		logger.info(extManager.checkExecution());
	}
}
