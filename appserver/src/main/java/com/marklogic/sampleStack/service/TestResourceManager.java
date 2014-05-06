package com.marklogic.sampleStack.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;


/**
 * Prototyping extension use.
 * @author cgreer
 *
 */
@Component
public class TestResourceManager extends ResourceManager {

	public static final String name = "test-ext.xqy";

	private final Logger logger = LoggerFactory
			.getLogger(TestResourceManager.class);
	
	@Autowired
	DatabaseClient client;
	
	
	public String checkExecution() {
		client.init(name,  this);  // is this expensive?
		RequestParameters params = new RequestParameters();
		params.add("param1", "value1");
		String[] mimetypes = new String[] { "application/json" };
	        
		ServiceResultIterator resultIterator = getServices().get(params, mimetypes);
		
		if (resultIterator.hasNext() ){
			ServiceResult result = resultIterator.next();
			return result.getContent(new StringHandle()).get();
		}
		return null;
	}
}
