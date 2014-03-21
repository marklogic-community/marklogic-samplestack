package com.marklogic.sasquatch.impl;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.io.FileHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.io.OutputStreamHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.io.ValuesHandle;
import com.marklogic.client.query.CountedDistinctValue;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.RawCombinedQueryDefinition;
import com.marklogic.client.query.ValuesDefinition;
import com.marklogic.sasquatch.domain.FooBean;
import com.marklogic.sasquatch.marklogic.FooBeanNotFoundException;
import com.marklogic.sasquatch.marklogic.FooDataService;

@Component
public class FooDataServiceImpl implements FooDataService {

	private final Logger logger = LoggerFactory
			.getLogger(FooDataServiceImpl.class);

	@Autowired
	private DatabaseClient client;

	@Autowired
	private ObjectMapper mapper;

	@Override
	public FooBean getFooBean(Long id) {
		try {
			InputStreamHandle handle = client.newJSONDocumentManager().read(
					"/beans/" + Long.toString(id), new InputStreamHandle());
			return mapper.readValue(handle.get(), FooBean.class);
		} catch (ResourceNotFoundException e) {
			throw new FooBeanNotFoundException();
		} catch (IOException e) {
			throw new SasquatchExcepion(e);
		}
	}

	@Override
	public void storeFooBean(FooBean bean) {
		logger.info("Storing bean id " + bean.getId());

		String jsonString = null;
		try {
			jsonString = mapper.writeValueAsString(bean);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		client.newJSONDocumentManager().write("/beans/" + bean.getId(),
				new StringHandle(jsonString));
	}

	@Override
	public void deleteFooBean(Long id) {
		client.newJSONDocumentManager().delete("/beans/" + Long.toString(id));
	}

	@Override
	public List<String> getFooIds() {
		ClassPathResource values1 = new ClassPathResource("values1.json");
		try {
			FileHandle fileHandle = new FileHandle(values1.getFile()).withFormat(Format.JSON);
			QueryManager queryManager = client.newQueryManager();
			RawCombinedQueryDefinition qdef = queryManager.newRawCombinedQueryDefinition(fileHandle);
			ValuesDefinition valdef = queryManager.newValuesDefinition("beans");
			valdef.setQueryDefinition(qdef);
			ValuesHandle handle = client.newQueryManager().values(valdef,
					new ValuesHandle());
			
			List<String> docUrisList = new ArrayList<String>();
			for (CountedDistinctValue value : handle.getValues()) {
				docUrisList.add(value.get("string", String.class));
			}
			return docUrisList;
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}
}
