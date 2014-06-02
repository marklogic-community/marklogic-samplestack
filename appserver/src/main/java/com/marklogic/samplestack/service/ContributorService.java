package com.marklogic.samplestack.service;

import java.util.List;
import java.util.UUID;

import com.marklogic.samplestack.domain.Contributor;

/**
 * Defines methods for interacting with the database of User objects.
 * 
 */
public interface ContributorService {

	/**
	 * get a User object by Id
	 * @param id the user's id
	 * @return a User object
	 */
	public Contributor get(UUID id);

	/**
	 * Store a user object's state in the database.
	 * Requires (on the database side) rest-writer privilege.
	 * A user can update their own record if they are a 'user'
	 * An expert can update any?
	 * @param user the user object.
	 */
	public void store(Contributor user);

	/**
	 * Delete the contriubtor at UUID id
	 * A user can update their own record if they are a 'user'
	 * An expert can update any?
	 * @param user the user object.
	 */
	public void delete(UUID id);

	/**
	 * Get a page's worth of Contributor objects
	 * (as defined in "contributors" options node)
	 * TODO replace with facade item.
	 * @param start the index of the first item to return
	 * @return List of contributors starting at start
	 */
	public List<Contributor> list(long start);
	
	/**
	 * Search for contributors with a query string
	 * (as defined in "contributors" options node
	 * TODO replace with facade item.
	 * @param start the index of the first item to return
	 * @return List of contributors starting at start
	 */
	public List<Contributor> search(String queryString);

}
