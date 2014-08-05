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

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.Transaction;
import com.marklogic.client.document.DocumentPage;
import com.marklogic.client.document.DocumentRecord;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryDefinition;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.SamplestackType;
import com.marklogic.samplestack.exception.SampleStackDataIntegrityException;
import com.marklogic.samplestack.exception.SamplestackException;
import com.marklogic.samplestack.exception.SamplestackIOException;
import com.marklogic.samplestack.exception.SamplestackNotFoundException;
import com.marklogic.samplestack.service.ContributorService;

/**
 * Service implementation for Contributors.
 * To be replaced by POJO Facade before GA release.
 * @see com.marklogic.samplestack.service.ContributorService
 */
@Component
public class ContributorServiceImpl extends AbstractMarkLogicDataService
		implements ContributorService {

	private final Logger logger = LoggerFactory
			.getLogger(ContributorServiceImpl.class);

	private final SamplestackType type = SamplestackType.CONTRIBUTORS;

	private String docUri(String id) {
		return type.directoryName() + id + ".json";
	}

	@Override
	public Contributor get(String id) {
		try {
			String documentUri = docUri(id);
			logger.debug("Fetching document uri " + documentUri);
			InputStreamHandle handle = jsonDocumentManager(
					ClientRole.SAMPLESTACK_CONTRIBUTOR).read(documentUri,
					new InputStreamHandle());
			return mapper.readValue(handle.get(), Contributor.class);
		} catch (ResourceNotFoundException e) {
			throw new SamplestackNotFoundException();
		} catch (IOException e) {
			throw new SamplestackIOException(e);
		}
	}

	@Override
	public void delete(String id) {
		jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).delete(
				docUri(id));
	}

	@Override
	// TODO remove, not needed?
	public List<Contributor> search(String queryString) {
		DocumentPage page = operations.searchInClass(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, type, queryString, 1);
		return asList(page);
	}

	// TODO refactor to use multipart response
	private List<Contributor> asList(DocumentPage page) {
		List<Contributor> l = new ArrayList<Contributor>();
		while (page.hasNext()) {
			DocumentRecord record = page.next();
			InputStreamHandle handle = record
					.getContent(new InputStreamHandle());
			try {
				l.add(mapper.readValue(handle.get(), Contributor.class));
			} catch (IOException e) {
				throw new SamplestackIOException(e);
			}
		}
		return l;
	}

	@Override
	public List<Contributor> list(long start) {
		StructuredQueryBuilder qb = new StructuredQueryBuilder("contributors");
		QueryDefinition qdef = qb.directory(true, type.directoryName());
		DocumentPage page = operations.search(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, qdef, start);
		return asList(page);
	}

	@Override
	public Contributor getByUserName(String userName) {
		StructuredQueryBuilder qb = new StructuredQueryBuilder("contributors");
		// TODO repository/facade/json property
		QueryDefinition qdef = qb.and(qb.directory(true, type.directoryName()),
				qb.value(qb.element("userName"), userName));

		DocumentPage page = operations.search(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, qdef, 1);
		if (page.getTotalSize() == 1) {
			InputStreamHandle handle = page.nextContent(new InputStreamHandle().withFormat(Format.JSON));
			try {
				return mapper.readValue(handle.get(), Contributor.class);
			} catch (IOException e) {
				throw new SamplestackIOException(e);
			}
		} else if (page.size() > 1) {
			throw new SampleStackDataIntegrityException(
					"Cardinality violation for userName " + userName);
		} else {
			return null;
		}

	}

	@Override
	public void store(Contributor contributor) {
		store(contributor, null);
	}

	@Override
	public void store(Contributor contributor, Transaction transaction) {
		logger.debug("Storing contributor id " + contributor.getId());
		// TODO cache will speed this up.
		Contributor cachedContributor = getByUserName(contributor.getUserName());
		if (cachedContributor != null) logger.debug("cached" + cachedContributor.getId());
		if (contributor != null) logger.debug("cont" + contributor.getId());
		
		if (cachedContributor != null && !(cachedContributor.getId().equals(contributor.getId()))) {
			throw new SampleStackDataIntegrityException("username "
					+ contributor.getUserName()
					+ " collides with pre-existing one");
		}

		String jsonString = null;
		try {
			jsonString = mapper.writeValueAsString(contributor);
		} catch (JsonProcessingException e) {
			throw new SamplestackException(e);
		}
		if (transaction == null) {
			jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).write(
					docUri(contributor.getId()), new StringHandle(jsonString));
		} else {
			jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).write(
					docUri(contributor.getId()), new StringHandle(jsonString),
					transaction);
		}
	}

}
