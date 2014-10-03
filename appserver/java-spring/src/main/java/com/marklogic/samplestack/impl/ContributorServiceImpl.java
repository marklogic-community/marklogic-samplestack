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

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.Transaction;
import com.marklogic.client.io.marker.SearchReadHandle;
import com.marklogic.client.pojo.PojoPage;
import com.marklogic.client.pojo.PojoQueryBuilder;
import com.marklogic.client.pojo.PojoRepository;
import com.marklogic.client.query.QueryDefinition;
import com.marklogic.client.query.StringQueryDefinition;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.exception.SampleStackDataIntegrityException;
import com.marklogic.samplestack.exception.SamplestackUnsupportedException;
import com.marklogic.samplestack.service.ContributorAddOnService;
import com.marklogic.samplestack.service.MarkLogicOperations;

/**
 * Beyond the repository interface, provides a few useful methods for searching
 * the Contributors domain.
 * @see com.marklogic.samplestack.service.ContributorAddOnService
 */
@Component
public class ContributorServiceImpl implements ContributorAddOnService {

	private final Logger logger = LoggerFactory
			.getLogger(ContributorServiceImpl.class);

	@Autowired
	protected MarkLogicOperations operations;
	
	@Autowired
	private PojoRepository<Contributor, String> repository;

	public void write(Contributor entity) {
		store(entity);
	}

	public void write(Contributor entity, String... collections) {
		throw new SamplestackUnsupportedException("Collections of contributors is not supported");
	}

	public void write(Contributor entity, Transaction transaction) {
		store(entity, transaction);
	}

	public void write(Contributor entity, Transaction transaction,
			String... collections) {
		throw new SamplestackUnsupportedException("Collections of contributors is not supported");
	}

	public boolean exists(String id) {
		return repository.exists(id);
	}

	public long count() {
		return repository.count();
	}

	public long count(String... collection) {
		return repository.count(collection);
	}

	public long count(QueryDefinition query) {
		return repository.count(query);
	}

	public void delete(String... ids) {
		repository.delete(ids);
	}

	public void deleteAll() {
		repository.deleteAll();
	}

	public Contributor read(String id) {
		return repository.read(id);
	}

	public Contributor read(String id, Transaction transaction) {
		return repository.read(id, transaction);
	}

	public PojoPage<Contributor> read(String[] ids) {
		return repository.read(ids);
	}

	public PojoPage<Contributor> read(String[] ids, Transaction transaction) {
		return repository.read(ids, transaction);
	}

	public PojoPage<Contributor> readAll(long start) {
		return repository.readAll(start);
	}

	public PojoPage<Contributor> readAll(long start, Transaction transaction) {
		return repository.readAll(start, transaction);
	}

	public PojoPage<Contributor> search(long start, String... collections) {
		return repository.search(start, collections);
	}

	public PojoPage<Contributor> search(long start, Transaction transaction,
			String... collections) {
		return repository.search(start, transaction, collections);
	}

	public PojoPage<Contributor> search(QueryDefinition query, long start) {
		return repository.search(query, start);
	}

	public PojoPage<Contributor> search(QueryDefinition query, long start,
			Transaction transaction) {
		return repository.search(query, start, transaction);
	}

	public PojoPage<Contributor> search(QueryDefinition query, long start,
			SearchReadHandle searchHandle) {
		return repository.search(query, start, searchHandle);
	}

	public PojoPage<Contributor> search(QueryDefinition query, long start,
			SearchReadHandle searchHandle, Transaction transaction) {
		return repository.search(query, start, searchHandle, transaction);
	}

	public PojoQueryBuilder<Contributor> getQueryBuilder() {
		return repository.getQueryBuilder();
	}

	public long getPageLength() {
		return repository.getPageLength();
	}

	public void setPageLength(long length) {
		repository.setPageLength(length);
	}

	public DatabaseClient getDatabaseClient() {
		return repository.getDatabaseClient();
	}

	@Override
	public Contributor getByUserName(String userName) {
		@SuppressWarnings("rawtypes")
		PojoQueryBuilder qb = operations.getContributors().getQueryBuilder();
		QueryDefinition qdef = qb.value("userName", userName);

		PojoPage<Contributor> page = operations.getContributors().search(qdef,
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
