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



/**
 *  Wraps just those values from a Contributor object
 *  that are denormalized and stored with QnADocuments.
 */
public class SparseContributor {

	/**
	 * The String identifier for this user, a primary key.
	 */
	public String id;
	
	/** The contributor's display name */
	public String displayName;

	
	/** The username.  */
	public String userName;


	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getDisplayName() {
		return displayName;
	}

	public void setDisplayName(String displayName) {
		this.displayName = displayName;
	}

	public void setId(String id) {
		this.id = id;
	}
	
	public String getId() {
		return id;
	}
}
