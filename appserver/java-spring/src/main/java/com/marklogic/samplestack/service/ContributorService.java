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

import com.marklogic.client.Transaction;
import com.marklogic.client.pojo.PojoPage;
import com.marklogic.client.pojo.PojoRepository;
import com.marklogic.samplestack.domain.Contributor;

/**
 * Defines methods for interacting with the database of User objects.
 * TODO will be replaced by direct use of the Pojo Facade, new for MarkLogic 8.
 */
public interface ContributorService extends PojoRepository<Contributor, String>{

	/**
	 * Get a specific user by UserName
	 * @param userName
	 * @return a Contributor object fetched from the database by userName
	 */
	public Contributor getByUserName(String userName);

	/**
	 * Search for a generic string, based on stored query options for contributors
	 * @param q the query string
	 * @return A PojoPage of Contributors
	 */
	public PojoPage<Contributor> search(String q);
	
	/**
	 * A wrapper around write, this method provides
	 * cardinality protection upon insert for userName
	 */
	 public void store(Contributor contributor);

	/**
	 * A wrapper around write, this method provides
	 * cardinality protection upon insert for userName
	 * @param contributor
	 * @param transaction transaction in which to store the contributor.
	 */
	void store(Contributor contributor, Transaction transaction);
}
