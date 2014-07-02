package com.marklogic.samplestack.mock;

import org.springframework.stereotype.Component;

import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.service.TagsService;

@Component
public class MockTagsService implements TagsService {

	@Override
	public String[] suggestTags(ClientRole role, String pattern) {
		return new String[] {"a", "b"};
	}

	@Override
	public String[] suggestTags(ClientRole role) {
		return suggestTags(role, "");
	}

}
