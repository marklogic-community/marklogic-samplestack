package com.marklogic.sasquatch.marklogic;

import com.marklogic.sasquatch.domain.GithubTag;

public interface GithubTagDataService {

	public GithubTag get(String id);
	
	/**
	 * Stores a triple-based object and returns a document URI for it.
	 * @param bean
	 * @return
	 */
	public String store(GithubTag bean);
	
	public void delete(String id);

	
}
