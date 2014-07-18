package com.marklogic.samplestack.domain;


public class SparseContributor {

	/** The contributor's display name */
	public String displayName;

	/**
	 * The String identifier for this user, a primary key. We use UUIDs to
	 * generate new ids, but support String in order to use legacy data as-is
	 */
	public String id;


	/** The username.  TODO validate as email address */
	private String userName;


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


	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}


}
