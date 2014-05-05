package com.marklogic.sampleStack.impl;

import java.io.IOException;
import java.util.Date;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.sampleStack.SampleStackException;
import com.marklogic.sampleStack.domain.User;
import com.marklogic.sampleStack.service.SamplestackNotFoundException;
import com.marklogic.sampleStack.service.UserService;

@Component
public class UserServiceImpl extends AbstractMarkLogicDataService implements
		UserService {

	private final Logger logger = LoggerFactory
			.getLogger(UserServiceImpl.class);

	@Override
	public User get(String id) {
		try {
			InputStreamHandle handle = jsonDocumentManager.read("/user/" + id,
					new InputStreamHandle());
			return mapper.readValue(handle.get(), User.class);
		} catch (ResourceNotFoundException e) {
			throw new SamplestackNotFoundException();
		} catch (IOException e) {
			throw new SampleStackException(e);
		}
	}

	@Override
	public void store(User user) {
		logger.info("Storing foo id " + user.getId());
		if (user.getCreationDate() == null) {
			user.setCreationDate(new Date());
		}
		user.setLastAccessDate(new Date());

		String jsonString = null;
		try {
			jsonString = mapper.writeValueAsString(user);
		} catch (JsonProcessingException e) {
			throw new SampleStackException(e);
		}
		jsonDocumentManager.write("/user/" + user.getId(), new StringHandle(
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
	public List<User> search(String queryString) {
		// TODO Auto-generated method stub
		return null;
	}

}
