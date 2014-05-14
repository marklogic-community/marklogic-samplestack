package com.marklogic.sampleStack.impl;

import java.io.IOException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.sampleStack.SampleStackException;
import com.marklogic.sampleStack.domain.Contributor;
import com.marklogic.sampleStack.service.ContributorService;
import com.marklogic.sampleStack.service.SamplestackNotFoundException;

@Component
public class ContributorServiceImpl extends AbstractMarkLogicDataService implements
		ContributorService {

	private final Logger logger = LoggerFactory
			.getLogger(ContributorServiceImpl.class);
	
	private final String DIR_NAME = "/contributor/";

	@Override
	public Contributor get(String id) {
		try {
			InputStreamHandle handle = jsonDocumentManager.read(DIR_NAME + id + ".json",
					new InputStreamHandle());
			return mapper.readValue(handle.get(), Contributor.class);
		} catch (ResourceNotFoundException e) {
			throw new SamplestackNotFoundException();
		} catch (IOException e) {
			throw new SampleStackException(e);
		}
	}

	@Override
	public void store(Contributor contributor) {
		logger.info("Storing contributor id " + contributor.getId());
		
		String jsonString = null;
		try {
			jsonString = mapper.writeValueAsString(contributor);
		} catch (JsonProcessingException e) {
			throw new SampleStackException(e);
		}
		jsonDocumentManager.write(DIR_NAME + contributor.getId() + ".json", new StringHandle(
				jsonString));
	}

	@Override
	public void delete(Long id) {
		// TODO Auto-generated method stub

	}

	@Override
	public List<String> getDocumentUris() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public List<Contributor> search(String queryString) {
		// TODO Auto-generated method stub
		return null;
	}

}
