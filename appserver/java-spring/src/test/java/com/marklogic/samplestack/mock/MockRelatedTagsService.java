package com.marklogic.samplestack.mock;

import org.springframework.stereotype.Component;

import com.marklogic.samplestack.service.RelatedTagsService;

@Component
public class MockRelatedTagsService implements RelatedTagsService {

	@Override
	public String getRelatedTags(String tag) {
		return "";
	}

}
