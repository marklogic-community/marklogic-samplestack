package com.marklogic.samplestack.impl;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.service.MarkLogicOperations;


/**
 * Client-side code for using a related-tags extension
 * on the MarkLogic Server
 *
 */
@Component
public class RelatedTagsManager extends ResourceManager {

	public static final String name = "related-tags.xqy";

	@SuppressWarnings("unused")
	private final Logger logger = LoggerFactory
			.getLogger(RelatedTagsManager.class);
	
	@Autowired
	MarkLogicOperations operations;
	
	
	public List<String> getRelatedTags(String tag) {
		operations.initResource(ClientRole.SAMPLESTACK_CONTRIBUTOR, name,  this);  // is this expensive?
		RequestParameters params = new RequestParameters();
		params.add("tag", tag);
		String[] mimetypes = new String[] { "application/json" };
	    List<String> results = new ArrayList<String>();
	    
		ServiceResultIterator resultIterator = getServices().get(params, mimetypes);
		
		if (resultIterator.hasNext() ){
			ServiceResult result = resultIterator.next();
			results.add(result.getContent(new StringHandle()).get());
		}
		return results;
	}
}
