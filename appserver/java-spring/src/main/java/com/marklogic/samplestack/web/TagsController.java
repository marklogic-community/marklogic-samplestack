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
package com.marklogic.samplestack.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.service.TagsService;

/**
 * Controller that exposes endpoint for tags support.
 */
@RestController
public class TagsController {

	@Autowired
	private TagsService tagsService;

	@SuppressWarnings("unused")
	private final Logger logger = LoggerFactory.getLogger(TagsController.class);

	/**
	 * Exposes the tags endpoint, which provides suggestions based on the request parameter.
	 * @param q A query pattern
	 * @return A list of tags as Strings.
	 */
	@RequestMapping(value = "tags", method = RequestMethod.GET)
	public @ResponseBody
	String[] suggestTags(@RequestParam(required = false) String q) {
		if (q == null) {
			return tagsService.suggestTags(ClientRole.securityContextRole());
		} else {
			return tagsService.suggestTags(ClientRole.securityContextRole(), q);
		}
	}
}
