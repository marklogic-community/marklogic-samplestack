package com.marklogic.samplestack.service;

import com.marklogic.samplestack.domain.ClientRole;

public interface TagsService {


	public String[] suggestTags(ClientRole role);
	
	public String[] suggestTags(ClientRole role, String pattern);
	
}
