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

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.marklogic.client.Transaction;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.service.ContributorService;
import com.marklogic.samplestack.testing.Utils;

@Component
/**
 * A mock version of Contributor Service which provides fast, simple, wrong answers to unit tests.
 */
public class MockContributorService implements ContributorService {

	@Override
	public Contributor get(String id) {
		Contributor newContributor = new Contributor();
		newContributor.setId(id);
		return newContributor;
	}

	@Override
	public void store(Contributor contributor) {
		// do nothing
	}

	@Override
	public void delete(String id) {
		// do nothing
	}

	private List<Contributor> contributorList() {
		Contributor c1 = new Contributor();
		Contributor c2 = new Contributor();
		c1.setId("1");
		c1.setDisplayName("contributor1");
		c2.setId("2");
		c2.setDisplayName("contributor2");
		List<Contributor> l = new ArrayList<Contributor>();
		l.add(c1);
		l.add(c2);
		return l;
	}

	@Override
	public List<Contributor> list(long start) {
		return contributorList();
	}

	@Override
	public List<Contributor> search(String queryString) {
		return contributorList();
	}

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
	public void store(Contributor contributor, Transaction transaction) {
		//
	}

}
