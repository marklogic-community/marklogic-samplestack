package com.marklogic.sampleStack.domain;

import java.util.Date;

/**
 * A User represents the end-user of the sampleStack application. It's a simple
 * POJO. It's canonical JSON representation is
 * 
 * <pre>
 * {
 *   "User":
 *     {
 *     "UpVotes": "0",
 *     "WebsiteUrl": "http://developer.marklogic.com",
 *     "DownVotes": "0",
 *     "Id": "1070312",
 *     "Views": "0",
 *     "Reputation": "1",
 *     "CreationDate": "2011-11-28T23:11:00.727",
 *     "DisplayName": "Travism",
 *     "LastAccessDate": "2014-01-18T00:57:34.643",
 *     "AboutMe": ""
 *     }}
 * </pre>
 * 
 */
public class User {

	private Long upVotes;
	private String websiteUrl;
	private Long downVotes;
	private String id;
	public Long getUpVotes() {
		return upVotes;
	}
	public void setUpVotes(Long upVotes) {
		this.upVotes = upVotes;
	}
	public String getWebsiteUrl() {
		return websiteUrl;
	}
	public void setWebsiteUrl(String websiteUrl) {
		this.websiteUrl = websiteUrl;
	}
	public Long getDownVotes() {
		return downVotes;
	}
	public void setDownVotes(Long downVotes) {
		this.downVotes = downVotes;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public Long getViews() {
		return views;
	}
	public void setViews(Long views) {
		this.views = views;
	}
	public Integer getReputation() {
		return reputation;
	}
	public void setReputation(Integer reputation) {
		this.reputation = reputation;
	}
	public Date getCreationDate() {
		return creationDate;
	}
	public void setCreationDate(Date creationDate) {
		this.creationDate = creationDate;
	}
	public String getDisplayName() {
		return displayName;
	}
	public void setDisplayName(String displayName) {
		this.displayName = displayName;
	}
	public Date getLastAccessDate() {
		return lastAccessDate;
	}
	public void setLastAccessDate(Date lastAccessDate) {
		this.lastAccessDate = lastAccessDate;
	}
	public String getAboutMe() {
		return aboutMe;
	}
	public void setAboutMe(String aboutMe) {
		this.aboutMe = aboutMe;
	}
	private Long views;
	private Integer reputation;
	private Date creationDate;
	private String displayName;
	private Date lastAccessDate;
	private String aboutMe;
}
