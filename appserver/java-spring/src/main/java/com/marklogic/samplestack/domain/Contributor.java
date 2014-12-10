/*
 * Copyright 2012-2014 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.samplestack.domain;

import java.util.HashMap;
import java.util.Map;

import com.marklogic.client.pojo.annotation.Id;

/**
 * Represents the end-user of the samplestack application. Its canonical JSON
 * representation is
 * 
 * <pre>
 *   {
 *       "id": "1070312",
 *       "originalId":"1070321",
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
public class Contributor {

	/** A markdown mini bio of the contributor */
	private String aboutMe;

	/** The contributor's display name */
	public String displayName;

	@Id
	/**
	 * The String identifier for this user, a primary key.
	 */
	public String id;

	/**
	 * The id from the original record, if imported from
	 * another system.
	 */
	public String originalId;

	/** The location of the user, as a String */
	private String location;

	/**
	 * A number that is updated each time somebody votes on a contributor's
	 * posts
	 */
	private int reputation;

	/** The username.  */
	public String userName;

	/** Set of posts on which this contributor has voted */
	private Map<String, Integer> votes = new HashMap<String, Integer>();

	/** URL of this contributor's website. */
	private String websiteUrl;

	/**
	 * return a copy of this object as sparse object, to be used
	 * within QnADocument serializations
	 * @return a SparseContributor object with values from this one.
	 */
	public SparseContributor asSparseContributor() {
		SparseContributor sparseContributor = new SparseContributor();
		sparseContributor.setId(this.id);
		sparseContributor.setDisplayName(this.getDisplayName());
		sparseContributor.setUserName(this.getUserName());
		return sparseContributor;
	}

	public String getAboutMe() {
		return aboutMe;
	}

	public String getDisplayName() {
		return displayName;
	}

	public String getId() {
		return id;
	}

	public String getLocation() {
		return location;
	}

	public int getReputation() {
		return reputation;
	}

	
	public String getUserName() {
		return userName;
	}

	public Map<String, Integer> getVotes() {
		if (votes == null) {
			this.votes = new HashMap<String, Integer>();
		}
		return votes;
	}

	public String getWebsiteUrl() {
		return websiteUrl;
	}

	public boolean hasVotedOn(String postId) {
		if (this.votes == null) {
			return false;
		} else {
			return this.votes.keySet().contains(postId);
		}
	}

	public void setAboutMe(String aboutMe) {
		this.aboutMe = aboutMe;
	}
	
	public void setDisplayName(String displayName) {
		this.displayName = displayName;
	}

	
	public void setId(String id) {
		this.id = id;
	}


	public void setLocation(String location) {
		this.location = location;
	}

	public void setReputation(int reputation) {
		this.reputation = reputation;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public void setVotes(Map<String, Integer> votes) {
		this.votes = votes;
	}


	public void setWebsiteUrl(String websiteUrl) {
		this.websiteUrl = websiteUrl;
	}


	public String getOriginalId() {
		return originalId;
	}

	public void setOriginalId(String originalId) {
		this.originalId = originalId;
	}


}
