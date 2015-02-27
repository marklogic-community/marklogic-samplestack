package com.marklogic.samplestack.service;

import com.fasterxml.jackson.databind.node.ObjectNode;


/**
 * Defines the methods for getting tags related to a particular one via
 * a semantic relationship, stored on the server as a REST
 * resource extension.
 * 
 * This service is fully functioning as part of the middle tier, but is
 * not exposed in the UI in 1.0.0
 */
public interface RelatedTagsService {

	/**
	 * Get all of the tags in the corpus related to the given one.  THe related tags 
	 * are returned as one long OR query which can be used to filter a values query
	 * subsequently.
	 * @param tag The tag for which I want related ones.
	 * @return A query string, to be combined with a tags search.
	 */
	public ObjectNode getRelatedTags(String tag);

}