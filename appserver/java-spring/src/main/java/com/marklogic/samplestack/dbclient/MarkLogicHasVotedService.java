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

/**
 * Exposes a method for looking up what items in a question a particular user has voted on.
 * Demonstrates a MarkLogic lexicon lookup.
 */
@Component
public class MarkLogicHasVotedService extends MarkLogicBaseService implements HasVotedService {

	@Autowired
	private ContributorService contributorService;
	
	
	/**
	 * Uses Java API method for finding values from a range index.
	 * @param role The ClientRole for database connection.
	 * @param postId The id of the QnADocument
	 * @return A ValuesResults obejct containing unique id values.
	 */
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
	/**
	 * Intersects a list of Contributor's votes with
	 * those of a post.
	 * @param role The ClientRole for database connection.
	 * @param contributorId The id of the contributor.
	 * @param postId The id of the QnADocument.
	 * @return A ValuesResults obejct containing unique id values.
	 */
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
