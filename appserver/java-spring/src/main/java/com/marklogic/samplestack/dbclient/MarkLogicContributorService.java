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
package com.marklogic.samplestack.dbclient;

import static com.marklogic.samplestack.SamplestackConstants.CONTRIBUTORS_OPTIONS;

import java.io.IOException;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.marklogic.client.Transaction;
import com.marklogic.client.pojo.PojoPage;
import com.marklogic.client.pojo.PojoQueryBuilder;
import com.marklogic.client.pojo.PojoQueryDefinition;
import com.marklogic.client.pojo.PojoRepository;
import com.marklogic.client.query.StringQueryDefinition;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.exception.SampleStackDataIntegrityException;
import com.marklogic.samplestack.exception.SamplestackIOException;
import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.service.ContributorService;

/**
 * This class exposes those methods of the POJORepository interface actually
 * implemented in Samplestack.
 * 
 * @see com.marklogic.samplestack.service.ContributorService
 */
@Component
public class MarkLogicContributorService extends MarkLogicBaseService implements
		ContributorService {

	private static Contributor joeUser;
	private static Contributor maryAdmin;

	private final Logger logger = LoggerFactory
			.getLogger(MarkLogicContributorService.class);

	@Autowired
	private PojoRepository<Contributor, String> repository;

	public void delete(String... ids) {
		repository.delete(ids);
	}

	public Contributor read(String id) {
		return repository.read(id);
	}

	public PojoPage<Contributor> search(PojoQueryDefinition query, long start) {
		return repository.search(query, start);
	}

	/**
	 * Samplestack needs to have the two users from LDAP loaded at all times.
	 * This is accomplished as part of the application container startup.
	 */
	@PostConstruct
	public void storeJoeAndMary() {
		try {
			// leave them alone if already in db.
			Contributor storedMary = this
					.read("9611450-0663-45a5-8a08-f1c71320475e");
			Contributor storedJoe = this
					.read("cf99542d-f024-4478-a6dc-7e723a51b040");

			if (storedJoe == null) {
				ClassPathResource joeResource = new ClassPathResource(
						"contributor/joeUser.json");
				joeUser = mapper.readValue(joeResource.getInputStream(),
						Contributor.class);
				this.store(joeUser);
			} else {
				logger.info("joeUser already in the database");
			}

			if (storedMary == null) {
				ClassPathResource maryResource = new ClassPathResource(
						"contributor/maryAdmin.json");
				maryAdmin = mapper.readValue(maryResource.getInputStream(),
						Contributor.class);
				this.store(maryAdmin);
			} else {
				logger.info("maryAdmin already in the database");
			}
		} catch (JsonParseException e) {
			throw new SamplestackIOException(
					"Setup of Joe/Mary Failed.  Check/clean/clear db", e);
		} catch (JsonMappingException e) {
			throw new SamplestackIOException(
					"Setup of Joe/Mary Failed.  Check/clean/clear db", e);
		} catch (IOException e) {
			throw new SamplestackIOException(
					"Setup of Joe/Mary Failed.  Check/clean/clear db", e);
		}
	}

	@Override
	public Contributor getByUserName(String userName) {
		@SuppressWarnings("rawtypes")
		PojoQueryBuilder qb = repository.getQueryBuilder();
		PojoQueryDefinition qdef = qb.value("userName", userName);

		PojoPage<Contributor> page = repository.search(qdef, 1);
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
		StringQueryDefinition qdef = queryManager(
				ClientRole.SAMPLESTACK_CONTRIBUTOR).newStringDefinition(
				CONTRIBUTORS_OPTIONS);
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
			logger.debug("cached contributor " + cachedContributor.getId());
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

	@Override
	public PojoPage<Contributor> readAll(int i) {
		return repository.readAll(i);
	}
}
