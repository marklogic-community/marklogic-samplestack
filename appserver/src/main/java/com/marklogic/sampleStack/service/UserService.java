package com.marklogic.sampleStack.service;

import java.util.List;

import com.marklogic.sampleStack.domain.Foo;
import com.marklogic.sampleStack.domain.User;

/**
 * Defines methods for interacting with the database of User objects.
 * 
 */
public interface UserService {

	/**
	 * get a User object by Id
	 * @param id the user's id
	 * @return a User object
	 */
	public User get(Long id);

	/**
	 * Store a user object's state in the database.
	 * Requires (on the database side) rest-writer privilege.
	 * A user can update their own record if they are a 'user'
	 * An expert can update any?
	 * @param user the user object.
	 */
	public void store(User user);

	public void delete(Long id);

	public List<String> getDocumentUris();

	public List<User> search(String queryString);
}
