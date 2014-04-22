package com.marklogic.sampleStack.impl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.io.SearchHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.MatchDocumentSummary;
import com.marklogic.sampleStack.domain.Foo;
import com.marklogic.sampleStack.marklogic.FooDataService;
import com.marklogic.sampleStack.marklogic.MarkLogicOperations;
import com.marklogic.sampleStack.marklogic.SasquatchNotFoundException;

@Component
public class FooDataServiceImpl implements FooDataService {

	private final Logger logger = LoggerFactory
			.getLogger(FooDataServiceImpl.class);

	@Autowired
	private MarkLogicOperations operations;
	
	@Autowired
	private DatabaseClient client;
	
	@Autowired
	private JSONDocumentManager jsonDocumentManager;
	
	@Bean 
	private JSONDocumentManager jsonDocumentManager() {
		return client.newJSONDocumentManager();
	};
	
	@Autowired
	private ObjectMapper mapper;

	@Override
	public Foo getFoo(Long id) {
		try {
			InputStreamHandle handle = jsonDocumentManager.read(
					"/foo/" + Long.toString(id), new InputStreamHandle());
			return mapper.readValue(handle.get(), Foo.class);
		} catch (ResourceNotFoundException e) {
			throw new SasquatchNotFoundException();
		} catch (IOException e) {
			throw new SampleStackException(e);
		}
	}

	@Override
	public void storeFoo(Foo foo) {
		logger.info("Storing foo id " + foo.getId());

		String jsonString = null;
		try {
			jsonString = mapper.writeValueAsString(foo);
		} catch (JsonProcessingException e) {
			throw new SampleStackException(e);
		}
		jsonDocumentManager.write("/foo/" + foo.getId(),
				new StringHandle(jsonString));
	}

	@Override
	public void deleteFooBean(Long id) {
		jsonDocumentManager.delete("/foo/" + Long.toString(id));
	}

	@Override
	public List<String> getDocumentUris() {
		return operations.getDocumentUris("/foo/");
	}

	@Override
	// TODO refactor to use multipart capability
	public List<Foo> search(String queryString) {
		SearchHandle results = operations.searchDirectory("/foo/", queryString);
		List<Foo> resultsFoos = new ArrayList<Foo>();
		for (MatchDocumentSummary result : results.getMatchResults()) {
			// this is slow, will fit multipart pattern
			String documentUri = result.getUri();
			InputStreamHandle handle = jsonDocumentManager.read(
					documentUri, new InputStreamHandle());
			try {
				resultsFoos.add(mapper.readValue(handle.get(), Foo.class));
			} catch (IOException e) {
				throw new SampleStackException(e);
			}
		}
		return resultsFoos;
	}

}
