/*
 * Copyright 2012-2015 MarkLogic Corporation
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
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.Transaction;
import com.marklogic.client.document.DocumentMetadataPatchBuilder;
import com.marklogic.client.io.DocumentMetadataHandle.Capability;
import com.marklogic.client.io.marker.DocumentPatchHandle;
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

	private static Contributor joe;
	private static Contributor mary;

	private final Logger logger = LoggerFactory
			.getLogger(MarkLogicContributorService.class);

	@Autowired
	private PojoRepository<Contributor, String> repository;

	public void delete(String... ids) {
		repository.delete(ids);
	}

	public Contributor read(String id) {
		try {
			return repository.read(id);
		} catch (ResourceNotFoundException ex) {
			return null;
		}
	}
	
	public Contributor read(String id, Transaction transaction) {
		try {
			return repository.read(id, transaction);
		} catch (ResourceNotFoundException ex) {
			return null;
		}
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
					.read("9611450a-0663-45a5-8a08-f1c71320475e");
			Contributor storedJoe = this
					.read("cf99542d-f024-4478-a6dc-7e723a51b040");

			if (storedJoe == null) {
				ClassPathResource joeResource = new ClassPathResource(
						"contributor/joe.json");
				joe = mapper.readValue(joeResource.getInputStream(),
						Contributor.class);
				this.store(joe);
			} else {
				logger.info("joe already in the database");
			}

			if (storedMary == null) {
				ClassPathResource maryResource = new ClassPathResource(
						"contributor/mary.json");
				mary = mapper.readValue(maryResource.getInputStream(),
						Contributor.class);
				this.store(mary);
			} else {
				logger.info("mary already in the database");
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
		return getByUserName(userName, null);
	}
	
	public Contributor getByUserName(String userName, Transaction transaction) {
		@SuppressWarnings("rawtypes")
		PojoQueryBuilder qb = repository.getQueryBuilder();
		PojoQueryDefinition qdef = qb.value("userName", userName);

		PojoPage<Contributor> page = null;
		if (transaction == null) {
			page = repository.search(qdef, 1);
		} else {
			page = repository.search(qdef, 1, transaction);
		}	
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
		Contributor cachedContributor = getByUserName(contributor.getUserName(), transaction);
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

		// HACK  -- how to use repository to patch permissions?
		DocumentMetadataPatchBuilder patchBuilder = jsonDocumentManager(
				ClientRole.SAMPLESTACK_CONTRIBUTOR).newPatchBuilder();

		patchBuilder.addPermission("samplestack-guest", Capability.READ);
		DocumentPatchHandle patch = patchBuilder.build();
		String uri = repository.getDocumentUri(contributor);
		if (transaction == null) {
			repository.write(contributor);
			jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).patch(uri, patch);
		} else {
			repository.write(contributor, transaction);
			jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).patch(uri, patch, transaction);
		}

	}

	@Override
	public PojoPage<Contributor> readAll(int i) {
		return repository.readAll(i);
	}

}
