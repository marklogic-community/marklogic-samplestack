package com.marklogic.sampleStack.domain;


/**
 * Represents the end-user of the samplestack application. 
 * Its canonical JSON representation is
 * 
 * <pre>
 * {
 *     "Id": "1070312",
 *     "Reputation": "1",
 *     "DisplayName": "grechaw",
 *     "AboutMe": "This is my user record",
 *     "WebsiteUrl": "http://github.com/grechaw",
 *     "Location":"Occidental, CA"
 * }
 * </pre>
 * 
 */
public class Contributor {

	/** URL of this contributor's website.  */
	private String websiteUrl;
	
	/** A number that is updated each time somebody votes on a contributor's posts */
	private int reputation;
	
	/** The contributor's display name */
	private String displayName;
	
	/** A markdown mini bio of the contributor */
	private String aboutMe;
	
	/** The string identifier for this user, a primary key */
	// @id
	private Long id;
	
	/** The location of the user, as a String */
	private String location;
	
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
	public String getDisplayName() {
		return displayName;
	}
	public void setDisplayName(String displayName) {
		this.displayName = displayName;
	}
	public String getAboutMe() {
		return aboutMe;
	}
	public void setAboutMe(String aboutMe) {
		this.aboutMe = aboutMe;
	}
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getLocation() {
		return location;
	}
	public void setLocation(String location) {
		this.location = location;
	}
	
}
