package com.marklogic.samplestack.impl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.document.DocumentPage;
import com.marklogic.client.document.DocumentRecord;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.io.SearchHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryDefinition;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.exception.SamplestackException;
import com.marklogic.samplestack.exception.SamplestackIOException;
import com.marklogic.samplestack.exception.SamplestackNotFoundException;
import com.marklogic.samplestack.service.ContributorService;

@Component
public class ContributorServiceImpl extends AbstractMarkLogicDataService
		implements ContributorService {

	private final Logger logger = LoggerFactory
			.getLogger(ContributorServiceImpl.class);

	private final String DIR_NAME = "/contributors/";

	private String docUri(String id) {
		return DIR_NAME + id + ".json";
	}

	@Override
	public Contributor get(String id) {
		try {
			String documentUri = docUri(id);
			logger.debug("Fetching document uri +" + documentUri);
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
	public void store(Contributor contributor) {
		logger.info("Storing contributor id " + contributor.getId());

		String jsonString = null;
		try {
			jsonString = mapper.writeValueAsString(contributor);
		} catch (JsonProcessingException e) {
			throw new SamplestackException(e);
		}
		jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).write(docUri(contributor.getId()),
				new StringHandle(jsonString));
	}

	@Override
	public void delete(String id) {
		jsonDocumentManager(ClientRole.SAMPLESTACK_CONTRIBUTOR).delete(docUri(id));
	}

	@Override
	// TODO remove, not needed?
	public List<Contributor> search(String queryString) {
		DocumentPage page = operations.searchDirectory(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, DIR_NAME, queryString);
		return asList(page);
	}

	// TODO refactor to use multipart response
	private List<Contributor> asList(DocumentPage page) {
		List<Contributor> l = new ArrayList<Contributor>();
		while (page.hasNext()) {
			DocumentRecord record = page.next();
			InputStreamHandle handle = record.getContent(new InputStreamHandle());
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
		QueryDefinition qdef = qb.directory(true, DIR_NAME);
		DocumentPage page = operations.search(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, qdef, start, null);
		return asList(page);
	}

	@Override
	public Contributor getByUserName(String userName) {
		StructuredQueryBuilder qb = new StructuredQueryBuilder("contributors");
		// TODO repository/facade/json property
		QueryDefinition qdef = qb.and(qb.directory(true,  DIR_NAME),
				qb.value(qb.element("userName"), userName));

		DocumentPage page = operations.search(
				ClientRole.SAMPLESTACK_CONTRIBUTOR, qdef, 1, null);
		List<Contributor> results = asList(page);
		return results.get(0);
	}

}
