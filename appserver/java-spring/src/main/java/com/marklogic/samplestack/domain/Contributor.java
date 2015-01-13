/*
 * Copyright 2012-2015 MarkLogic Corporation
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

import com.marklogic.client.pojo.annotation.Id;

/**
 * Represents the end-user of the samplestack application. Its canonical JSON
 * representation is
 * 
 * <pre>
 *   {
 *       "id": "1070312",
 *       "originalId":"1070321",
 *       "reputation": 10,
 *       "displayName": "grechaw",
 *       "aboutMe": "This is my user record",
 *       "websiteUrl": "http://github.com/grechaw",
 *       "location":"Occidental, CA",
 *       "voteCount": 10
 *   }
 * </pre>
 * 
 */
public class Contributor {

	/** A markdown mini bio of the contributor */
	private String aboutMe;

	/** The contributor's display name */
	private String displayName;

	@Id
	/**
	 * The String identifier for this user, a primary key.
	 */
	public String id;

	/**
	 * The id from the original record, if imported from
	 * another system.
	 */
	private String originalId;

	/** The location of the user, as a String */
	private String location;

	/**
	 * A number that is updated each time somebody votes on a contributor's
	 * posts
	 */
	private int reputation;

	/** The username.  */
	private String userName;

	/** The number of times this contributor has voted (up or down) */
	private long voteCount;
	
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

	public long getVoteCount() {
		return voteCount;
	}

	public String getWebsiteUrl() {
		return websiteUrl;
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

	public void setVoteCount(long voteCount) {
		this.voteCount = voteCount;
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
