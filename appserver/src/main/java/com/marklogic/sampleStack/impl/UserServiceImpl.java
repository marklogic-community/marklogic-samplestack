package com.marklogic.sampleStack.impl;

import java.util.List;

import org.springframework.stereotype.Component;

import com.marklogic.sampleStack.domain.ApplicationUser;
import com.marklogic.sampleStack.service.UserService;

@Component
public class UserServiceImpl implements UserService {

	@Override
	public ApplicationUser get(Long id) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void store(ApplicationUser user) {
		// TODO Auto-generated method stub

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
	public List<ApplicationUser> search(String queryString) {
		// TODO Auto-generated method stub
		return null;
	}

}
