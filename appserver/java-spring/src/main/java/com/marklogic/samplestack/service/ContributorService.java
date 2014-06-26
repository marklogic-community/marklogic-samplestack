package com.marklogic.samplestack.service;

import java.util.List;

import com.marklogic.client.Transaction;
import com.marklogic.samplestack.domain.Contributor;

/**
 * Defines methods for interacting with the database of User objects.
 * 
 */
public interface ContributorService {

	/**
	 * get a Contributor object from the database by Id
	 * @param id the contriubtor's identifier
	 * @return a Contributor object
	 */
	public Contributor get(String id);

	/**
	 * Store a user object's state in the database.
	 * @param contributor the user object.
	 */
	public void store(Contributor contributor);

	/**
	 * Delete a contributor object
	 * @param id the id of a contributor object.
	 */
	public void delete(String id);

	/**
	 * Get a page's worth of Contributor objects
	 * @param start the index of the first item to return
	 * @return List of contributors starting at start
	 */
	public List<Contributor> list(long start);
	
	/**
	 * Search for contributors with a query string
	 * @param start the index of the first item to return
	 * @return List of contributors starting at start
	 */
	public List<Contributor> search(String queryString);

	/**
	 * Get a specific user by UserName
	 * @param userName
	 * @return a Contributor object fetched from the database by userName
	 */
	public Contributor getByUserName(String userName);

	/**
	 * Store a contributor within a multi-statement transaction scope
	 * @param contributor The contributor object to persist
	 * @param transaction The transaction to use for this update.
	 *   Obtained from a queryManager.  Use transaction.commit() to commit the change.
	 */
	public void store(Contributor contributor, Transaction transaction);

}
