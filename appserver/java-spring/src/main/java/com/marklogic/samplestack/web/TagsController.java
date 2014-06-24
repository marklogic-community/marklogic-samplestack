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

@RestController
public class TagsController {

	@Autowired
	private TagsService tagsService;
	
	private final Logger logger = LoggerFactory
			.getLogger(TagsController.class);

	
	@RequestMapping(value = "tags", method = RequestMethod.GET)
	public @ResponseBody
	String[] suggestTags(@RequestParam(required = false) String q) {
		//TODO validate
		return tagsService.suggestTags(ClientRole.securityContextRole(), q);
	}
}
