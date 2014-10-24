package com.marklogic.samplestack.dbclient;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.marklogic.client.io.ValuesHandle;
import com.marklogic.client.query.CountedDistinctValue;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.StringQueryDefinition;
import com.marklogic.client.query.ValuesDefinition;
import com.marklogic.client.query.ValuesResults;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.service.ContributorService;
import com.marklogic.samplestack.service.HasVotedService;

@Component
public class MarkLogicHasVotedService extends MarkLogicBaseService implements HasVotedService {

	@Autowired
	private ContributorService contributorService;
	
	
	// uses native Java API method
	public ValuesResults idValues(ClientRole role, String postId) {
		QueryManager queryManager = queryManager(role);
		ValuesDefinition valdef = queryManager.newValuesDefinition("ids", "hasVoted");
		StringQueryDefinition qdef = queryManager.newStringDefinition("hasVoted");
		qdef.setCriteria("id:"+postId);
		valdef.setQueryDefinition(qdef);
		ValuesHandle responseHandle = queryManager.values(valdef, new ValuesHandle());
		return responseHandle;
	}

	
	@Override
	public Set<String> hasVoted(ClientRole role, String contributorId, String postId) {
		Contributor voter = contributorService.read(contributorId);
		Set<String> voteIds = null;
		if (voter == null) {
			voteIds = new HashSet<String>();
		} else {
			voteIds = voter.getVotes();
		}
		
		ValuesResults postIds = idValues(role, postId);
		Set<String> postSet = new HashSet<String>();
		for (CountedDistinctValue value : postIds.getValues()) {
			postSet.add(value.get("xs:string", String.class));
		}
		postSet.retainAll(voteIds);
		return postSet;
	}

}
