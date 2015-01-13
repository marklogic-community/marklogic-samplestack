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
package com.marklogic.samplestack.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.SamplestackConstants;
import com.marklogic.samplestack.exception.SamplestackInvalidParameterException;
import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.service.TagsService;

/**
 * Controller that exposes endpoint for tags support.
 */
@RestController
public class TagsController {

	@Autowired
	private TagsService tagsService;
	
	@Autowired 
	private ObjectMapper mapper;
	

	@SuppressWarnings("unused")
	private final Logger logger = LoggerFactory.getLogger(TagsController.class);

	/**
	 * 
	 */
	@RequestMapping(value = "v1/tags", method = RequestMethod.POST)
	public @ResponseBody
	ObjectNode tags(@RequestBody(required=false) ObjectNode structuredQuery) {
		
		if (structuredQuery == null) {
			structuredQuery = mapper.createObjectNode();
		}
		JsonNode postedStartNode = structuredQuery.get("start");
		JsonNode postedPageLength = structuredQuery.get("pageLength");
		JsonNode postedSort = structuredQuery.get("sort");
		JsonNode qtextNode = structuredQuery.get("qtext");

		long start = 1;
		long pageLength = SamplestackConstants.RESULTS_PAGE_LENGTH;
		String sortBy = "item";
		if (postedStartNode != null) {
			start = postedStartNode.asLong();
			structuredQuery.remove("start");
		}
		if (postedPageLength != null) {
			pageLength = postedPageLength.asLong();
			structuredQuery.remove("pageLength");
		}
		if (postedSort != null) {
			sortBy = postedSort.asText();
			structuredQuery.remove("sort");
		}
		if (sortBy != null) {
			if (sortBy.equals("item")) {
				sortBy = "item-order";
			} else if (sortBy.equals("frequency")) {
				sortBy = "frequency-order";
			} else {
				throw new SamplestackInvalidParameterException("Sort must be item or frequency");
			}
		}
		ObjectNode docNode = mapper.createObjectNode();
		ObjectNode searchNode = docNode.putObject("search");
		if (qtextNode != null) {
			searchNode.set("qtext", qtextNode);
			structuredQuery.remove("qtext");
		}
		searchNode.setAll(structuredQuery);
		ObjectNode optionsNode = searchNode.putObject("options");
		ObjectNode valuesNode = optionsNode.putObject("values");
		ObjectNode rangeNode = valuesNode.putObject("range");
		rangeNode.put("type", "xs:string");
		rangeNode.put("json-property", "tags");
		valuesNode.put("name", "tags");
		valuesNode.put("values-option", sortBy);
		//ObjectNode aggregateNode = valuesNode.putObject("aggregate");
		//aggregateNode.put("apply", "count");

		return tagsService.getTags(ClientRole.securityContextRole(), docNode, start, pageLength);
	}
	
	@RequestMapping(value = "v1/tags/{tag}", method = RequestMethod.POST)
	public @ResponseBody
	ObjectNode relatedTags(@RequestBody ObjectNode structuredQuery) {

		return tagsService.getTags(ClientRole.securityContextRole(), structuredQuery, 1, 1);
	}
}
