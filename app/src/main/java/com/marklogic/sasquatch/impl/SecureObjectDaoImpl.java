package com.marklogic.sasquatch.impl;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.sasquatch.domain.SecureObject;
import com.marklogic.sasquatch.marklogic.SasquatchNotFoundException;
import com.marklogic.sasquatch.marklogic.SecureObjectDao;

@Component
public class SecureObjectDaoImpl implements SecureObjectDao {

	@Autowired
	private DatabaseClient client;

	@Autowired
	private ObjectMapper mapper;

	@Override
	public SecureObject getObject(String uri) {
		try {
			InputStreamHandle handle = client.newJSONDocumentManager().read(
				uri, new InputStreamHandle());
			return mapper.readValue(handle.get(), SecureObject.class);
		} catch (ResourceNotFoundException e) {
			throw new SasquatchNotFoundException(); 
		} catch (IOException e) {
		
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	@Override
	public void storeSecureObject(String uri, SecureObject o) {
		String jsonString = null;
		try {
			jsonString = mapper.writeValueAsString(o);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		client.newJSONDocumentManager().write(uri,
				new StringHandle(jsonString));
	}

	@Override
	public SecureObject getAnnotatedDocument(SecureObject o) {
		return this.getObject(o.getAnnotatesDocument());
	}

}
