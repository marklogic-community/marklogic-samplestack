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
package com.marklogic.samplestack.impl;

import static com.marklogic.samplestack.SamplestackConstants.CONTRIBUTORS_OPTIONS;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.marklogic.client.Transaction;
import com.marklogic.client.pojo.PojoPage;
import com.marklogic.client.pojo.PojoQueryBuilder;
import com.marklogic.client.pojo.PojoRepository;
import com.marklogic.client.query.QueryDefinition;
import com.marklogic.client.query.StringQueryDefinition;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.exception.SampleStackDataIntegrityException;
import com.marklogic.samplestack.service.ContributorService;
import com.marklogic.samplestack.service.MarkLogicOperations;

/**
 * This class exposes those methods of the POJORepository interface
 * actually implemented in Samplestack.
 * @see com.marklogic.samplestack.service.ContributorService
 */
@Component
public class MarkLogicContributorService implements ContributorService {

	private final Logger logger = LoggerFactory
			.getLogger(MarkLogicContributorService.class);

	@Autowired
	protected MarkLogicOperations operations;
	
	@Autowired
	private PojoRepository<Contributor, String> repository;

	public void delete(String... ids) {
		repository.delete(ids);
	}

	public Contributor read(String id) {
		return repository.read(id);
	}

	public PojoPage<Contributor> search(QueryDefinition query, long start) {
		return repository.search(query, start);
	}

	@Override
	public Contributor getByUserName(String userName) {
		@SuppressWarnings("rawtypes")
		PojoQueryBuilder qb = repository.getQueryBuilder();
		QueryDefinition qdef = qb.value("userName", userName);

		PojoPage<Contributor> page = repository.search(qdef,
				1);
		if (page.getTotalSize() == 1) {
			return page.iterator().next();
		} else if (page.size() > 1) {
			throw new SampleStackDataIntegrityException(
					"Cardinality violation for userName " + userName);
		} else {
			return null;
		}
	}

	@Override
	public PojoPage<Contributor> search(String queryString) {
		StringQueryDefinition qdef = operations
				.newStringQueryDefinition(CONTRIBUTORS_OPTIONS);
		qdef.setCriteria(queryString);
		return this.search(qdef, 1);
	}

	@Override
	public void store(Contributor contributor) {
		store(contributor, null);
	}
	
	@Override
	public void store(Contributor contributor, Transaction transaction) {
		logger.debug("Storing contributor id " + contributor.getId());
		Contributor cachedContributor = getByUserName(contributor.getUserName());
		if (cachedContributor != null)
			logger.debug("cached contributor" + cachedContributor.getId());
		if (contributor != null)
			logger.debug("contributor " + contributor.getId());

		if (cachedContributor != null
				&& !(cachedContributor.getId().equals(contributor.getId()))) {
			throw new SampleStackDataIntegrityException("username "
					+ contributor.getUserName()
					+ " collides with pre-existing one");
		}
		if (transaction == null) {
			repository.write(contributor);
		} else {
			repository.write(contributor, transaction);
		}

	}
}
