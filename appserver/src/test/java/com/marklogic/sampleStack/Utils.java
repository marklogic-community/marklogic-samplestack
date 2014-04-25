package com.marklogic.sampleStack;

import java.util.Date;

import com.marklogic.sampleStack.domain.ApplicationUser;

public class Utils {

	public static ApplicationUser getBasicUser() {
		ApplicationUser user = new ApplicationUser();
		user.setAboutMe("Some text about a basic user");
		user.setAccountId("account01");
		user.setCreationDate(new Date());
		user.setDisplayName("grechaw");
		user.setLastAccessDate(new Date());
		user.setDownVotes(10L);
		user.setUpVotes(1L);
		user.setViews(10L);
		user.setWebsiteUrl("http://website.com/grechaw");
		return user;
	}

}
