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
package com.marklogic.samplestack.mock;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.marklogic.client.Transaction;
import com.marklogic.client.pojo.PojoPage;
import com.marklogic.client.pojo.PojoRepository;
import com.marklogic.client.query.QueryDefinition;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.service.ContributorAddOnService;
import com.marklogic.samplestack.testing.Utils;

@Component
/**
 * A mock version of Contributor Service which provides fast, simple, wrong answers to unit tests.
 */
public class MockContributorAddOnService implements ContributorAddOnService {


	@Autowired
	protected PojoRepository<Contributor, String> repo;
	
	@Override
	public Contributor getByUserName(String userName) {
		// for one real values test in login
		if (userName.equals("joeUser@marklogic.com")) {
			return Utils.joeUser;
		} else {
			Contributor newContributor = new Contributor();
			newContributor.setUserName(userName);
			return newContributor;
		}
	}

	@Override
	public PojoPage<Contributor> search(String q) {
		return repo.readAll(0L);
	}
	
	@Override
	public PojoPage<Contributor> search(QueryDefinition q, long start) {
		return repo.readAll(0L);
	}

	@Override
	public void store(Contributor contributor) {
		//ignore
	}

	@Override
	public void store(Contributor contributor, Transaction transaction) {
		//ignore
	}

	@Override
	public void delete(String... id) {
		// ignore
	}

	@Override
	public Contributor read(String id) {
		return repo.read(id);
	}

}
