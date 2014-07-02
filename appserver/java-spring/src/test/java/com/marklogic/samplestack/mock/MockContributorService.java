package com.marklogic.samplestack.mock;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.marklogic.client.Transaction;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.service.ContributorService;

@Component
public class MockContributorService implements ContributorService {

	@Override
	public Contributor get(String id) {
		return new Contributor();
	}

	@Override
	public void store(Contributor contributor) {
		// do nothing
	}

	@Override
	public void delete(String id) {
		// do nothing
	}

	private List<Contributor> contributorList() {
		Contributor c1 = new Contributor();
		Contributor c2 = new Contributor();
		List<Contributor> l = new ArrayList<Contributor>();
		l.add(c1);
		l.add(c2);
		return l;
	}

	@Override
	public List<Contributor> list(long start) {
		return contributorList();
	}

	@Override
	public List<Contributor> search(String queryString) {
		return contributorList();
	}

	@Override
	public Contributor getByUserName(String userName) {
		return new Contributor();
	}

	@Override
	public void store(Contributor contributor, Transaction transaction) {
		//
	}

}
