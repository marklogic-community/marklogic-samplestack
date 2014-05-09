package com.marklogic.sampleStack;

import com.marklogic.sampleStack.domain.Contributor;

public class Utils {

	public static Contributor getBasicUser() {
		Contributor user = new Contributor();
		user.setAboutMe("Some text about a basic user");
		user.setId("1");
		user.setDisplayName("grechaw");
		user.setWebsiteUrl("http://website.com/grechaw");
		return user;
	}

}
