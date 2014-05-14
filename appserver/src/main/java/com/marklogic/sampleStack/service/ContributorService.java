package com.marklogic.sampleStack.service;

import java.util.List;

import com.marklogic.sampleStack.domain.Contributor;

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
	public Contributor get(String string);

	/**
	 * Store a user object's state in the database.
	 * Requires (on the database side) rest-writer privilege.
	 * A user can update their own record if they are a 'user'
	 * An expert can update any?
	 * @param user the user object.
	 */
	public void store(Contributor user);

	public void delete(Long id);

	public List<String> getDocumentUris();

	public List<Contributor> search(String queryString);
}
