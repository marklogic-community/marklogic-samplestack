package com.marklogic.sasquatch.impl;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.sasquatch.domain.FooBean;
import com.marklogic.sasquatch.marklogic.FooBeanNotFoundException;
import com.marklogic.sasquatch.marklogic.FooDao;

@Component
public class FooDaoImpl implements FooDao {

	private final Logger logger = LoggerFactory.getLogger(FooDaoImpl.class);
	
	@Autowired
	private DatabaseClient client;

	@Autowired
	private ObjectMapper mapper;

	@Override
	public String getMessage() {
		return "HEY FROM FOODAO!";
	}

	@Override
	public FooBean getFooBean(Long id) {
		try {
			InputStreamHandle handle = client.newJSONDocumentManager().read(
				"/beans/" + Long.toString(id), new InputStreamHandle());
			return mapper.readValue(handle.get(), FooBean.class);
		} catch (ResourceNotFoundException e) {
			throw new FooBeanNotFoundException(); 
		} catch (IOException e) {
		
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;

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
}
