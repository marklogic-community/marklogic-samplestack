package com.marklogic.samplestack.mock;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.service.RelatedTagsService;

@Component
public class MockRelatedTagsService implements RelatedTagsService {

	@Autowired
	private ObjectMapper mapper;
	
	@Override
	public ObjectNode getRelatedTags(String tag) {
		try {
			return mapper.readValue("{\"qtext\":\"tag:XQ\"}", ObjectNode.class);
		} catch (JsonParseException e) {
			e.printStackTrace();
		} catch (JsonMappingException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
	}

}
