package com.marklogic.samplestack.domain;

import java.util.UUID;


/**
 * Represents the end-user of the samplestack application. 
 * Its canonical JSON representation is
 * 
 * <pre>
  {
      "id": "1070312",
      "reputation": "1",
      "displayName": "grechaw",
      "aboutMe": "This is my user record",
      "websiteUrl": "http://github.com/grechaw",
      "location":"Occidental, CA",
      "votes": [
         {type:"up", postId: "/answers/2422"},
         {type:"down", postId: "/questions/3422"}
     ]
  }
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
	
	/** The UUID identifier for this user, a primary key */
	//@id
	private UUID id;
	
	/** The location of the user, as a String */
	private String location;
	
	private String userName;
	
	public String getUserName() {
		return userName;
	}
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
	public UUID getId() {
		return id;
	}
	public void setId(UUID id) {
		this.id = id;
	}
	public String getLocation() {
		return location;
	}
	public void setLocation(String location) {
		this.location = location;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	
}
