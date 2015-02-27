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
package com.marklogic.samplestack.dbclient;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.service.RelatedTagsService;


/**
 * Implementation of the RelatedTags service.  
 * This class is an example of client-side support for a MarkLogic REST API
 * Service extension.  The extension name is "relatedTags" and it's implemented 
 * in JavaScript. 
 * <p/>
 * See <a href="http://google.com">http://docs.marklogic.com/guide/rest-dev/extensions</a>
 * See <a href="http://google.com">http://docs.marklogic.com/guide/java/resourceservices</a>
 * <p/>
 * The extension code is at /database/services/relatedTags.sjs
 */
@Component
public class RelatedTagsManager extends ResourceManager implements RelatedTagsService {

	@Autowired
	private Clients clients;
	
	public static final String EXTENSION_NAME = "relatedTags";

	@SuppressWarnings("unused")
	private final Logger logger = LoggerFactory
			.getLogger(RelatedTagsManager.class);
	
	/**
	 * Gets tags from the server that are related to the provided one.
	 * @param tag An input tag to check for related tags.
	 * @return A list of tags related to the input, as a JSON document
	 * to be delivered to the browser.
	 */
	public ObjectNode getRelatedTags(String tag) {
		clients.get(ClientRole.SAMPLESTACK_CONTRIBUTOR).init(EXTENSION_NAME,  this);  // is this expensive?
		RequestParameters params = new RequestParameters();
		params.add("tag", tag);
		String[] mimetypes = new String[] { "application/json" };
		
		ServiceResultIterator resultIterator = getServices().get(params, mimetypes);
		
		ObjectNode results = null;
		if (resultIterator.hasNext() ){
			ServiceResult result = resultIterator.next();
			results = (ObjectNode) result.getContent(new JacksonHandle()).get();
		}
		return results;
	}
}
