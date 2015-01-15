package com.marklogic.samplestack.service;


/**
 * Defines the methods for getting tags related to a particular one via
 * a semantic relationship, stored on the server as a REST
 * resource extension.
 */
public interface RelatedTagsService {

	/**
	 * Get all of the tags in the corpus related to the given one.  THe related tags 
	 * are returned as one long OR query which can be used to filter a values query
	 * subsequently.
	 * @param tag The tag for which I want related ones.
	 * @return A query string, to be combined with a tags search.
	 */
	public String getRelatedTags(String tag);

}