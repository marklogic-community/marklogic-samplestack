package com.marklogic.samplestack.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.service.MarkLogicOperations;
import com.marklogic.samplestack.service.TagsService;

@Component
public class TagsServiceImpl implements TagsService {

	@Autowired
	MarkLogicOperations operations;
	
	@Override
	public String[] suggestTags(ClientRole role) {
		return suggestTags(role, "");
	}

	@Override
	public String[] suggestTags(ClientRole role, String pattern) {
		String suggestPattern = "*" + pattern;
		return operations.suggestTags(role, suggestPattern);
	}

}
