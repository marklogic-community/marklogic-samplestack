package com.marklogic.samplestack.domain;

import java.util.HashSet;
import java.util.Set;

/**
 * Represents the end-user of the samplestack application. Its canonical JSON
 * representation is
 * 
 * <pre>
 *   {
 *       "id": "1070312",
 *       "reputation": "1",
 *       "displayName": "grechaw",
 *       "aboutMe": "This is my user record",
 *       "websiteUrl": "http://github.com/grechaw",
 *       "location":"Occidental, CA",
 *       "votes": [
 *          {type:"up", postId: "/answers/2422"},
 *          {type:"down", postId: "/questions/3422"}
 *      ]
 *   }
 * </pre>
 * 
 */
public class Contributor extends SparseContributor {

	/** URL of this contributor's website. */
	private String websiteUrl;

	/**
	 * A number that is updated each time somebody votes on a contributor's
	 * posts
	 */
	private int reputation;

	/** A markdown mini bio of the contributor */
	private String aboutMe;

	
	/** The location of the user, as a String */
	private String location;

	private Set<String> votes = new HashSet<String>();

	public String getWebsiteUrl() {
		return websiteUrl;
	}

	public void setWebsiteUrl(String websiteUrl) {
		this.websiteUrl = websiteUrl;
	}

	public int getReputation() {
		return reputation;
	}

	public void setReputation(int reputation) {
		this.reputation = reputation;
	}

	public String getAboutMe() {
		return aboutMe;
	}

	public void setAboutMe(String aboutMe) {
		this.aboutMe = aboutMe;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
	}

	
	public Set<String> getVotes() {
		if (votes == null) {
			this.votes = new HashSet<String>();
		}
		return votes;
	}

	public void setVotes(Set<String> votes) {
		this.votes = votes;
	}

	public boolean hasVotedOn(String postId) {
		if (this.votes == null) {
			return false;
		} else {
			return this.votes.contains(postId);
		}
	}

	/**
	 * return a copy of this object as sparse object, to be used
	 * within QnADocument serializations
	 * @return a SparseContributor object with values from this one.
	 */
	public SparseContributor asSparseContributor() {
		SparseContributor sparseContributor = new SparseContributor();
		sparseContributor.setId(this.getId());
		sparseContributor.setDisplayName(this.getDisplayName());
		sparseContributor.setUserName(this.getUserName());
		return sparseContributor;
	}

}
