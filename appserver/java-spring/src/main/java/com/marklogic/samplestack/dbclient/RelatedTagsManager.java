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
package com.marklogic.samplestack.dbclient;

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
import com.marklogic.samplestack.security.ClientRole;


/**
 * Client-side code for using a related-tags extension
 * on the MarkLogic Server.  An extension class must extend ResourceManager.
 */
@Component
public class RelatedTagsManager extends ResourceManager {

	@Autowired
	private Clients clients;
	
	public static final String name = "related-tags.xqy";

	@SuppressWarnings("unused")
	private final Logger logger = LoggerFactory
			.getLogger(RelatedTagsManager.class);
	
	/**
	 * Gets tags from the server that are related to the provided one.
	 * @param tag An input tag to check for related tags.
	 * @return A list of tags related to the input.
	 */
	public List<String> getRelatedTags(String tag) {
		clients.get(ClientRole.SAMPLESTACK_CONTRIBUTOR).init(name,  this);  // is this expensive?
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
