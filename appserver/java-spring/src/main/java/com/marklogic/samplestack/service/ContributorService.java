/*
 * Copyright 2012-2014 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.samplestack.service;

import java.util.List;

import com.marklogic.client.Transaction;
import com.marklogic.samplestack.domain.Contributor;

/**
 * Defines methods for interacting with the database of User objects.
 * TODO will be replaced by direct use of the Pojo Facade, new for MarkLogic 8.
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
