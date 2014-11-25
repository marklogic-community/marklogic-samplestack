package com.marklogic.samplestack.service;

import java.util.Set;

import com.marklogic.samplestack.security.ClientRole;

/**
 * Service to access the voting record
 * of a user given a particular question.
 */
public interface HasVotedService {

	/**
	 * Returns the list of questionIds and answerIds on which this
	 * contributor has voted, within one particular postId (question or answer)
	 * @param role security role for this query
	 * @param contributorId The contributor's ID
	 * @param postId An id within the QnADocument
	 * @return A Set of postIds in same document as postId.
	 */
	public Set<String> hasVoted(ClientRole role, String contributorId, String postId);
}
