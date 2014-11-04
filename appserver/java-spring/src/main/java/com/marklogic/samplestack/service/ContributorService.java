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
import com.marklogic.client.pojo.PojoQueryDefinition;
import com.marklogic.samplestack.domain.Contributor;

/**
 * Defines methods for interacting with the corpus of Contributor objects.
 * This interface hides and decorates methods from the POJORepository.
 */
public interface ContributorService {

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

	/**
	 * Wraps PojoRepository.delete
	 * @param id
	 */
	public void delete(String... id);

	/**
	 * Wraps PojoRepository.read
	 * @param id
	 * @return
	 */
	public Contributor read(String id);

	/**
	 * Wraps PojoRepository.search
	 * @param qdef A query definition
	 * @param start the first object to retrieve
	 * @return
	 */
	public PojoPage<Contributor> search(PojoQueryDefinition qdef, long start);

	public PojoPage<Contributor> readAll(int i);
}
