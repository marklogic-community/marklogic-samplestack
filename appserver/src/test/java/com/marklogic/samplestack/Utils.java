package com.marklogic.samplestack;

import static org.junit.Assert.assertEquals;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;

import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.service.MarkLogicOperations;

public class Utils {
	
	
	private static UUID basicUserUUID = UUID
			.fromString("779b383c-dbf3-4008-b9d8-64f0491f1d4a");
	private static UUID JoesUUID = UUID
			.fromString("cf99542d-f024-4478-a6dc-7e723a51b040");

	public static Contributor getBasicUser() {
		Contributor contributor = new Contributor();
		contributor.setAboutMe("Some text about a basic user");
		contributor.setId(basicUserUUID);
		contributor.setUserName("joeUser@marklogic.com");
		contributor.setDisplayName("grechaw");
		contributor.setWebsiteUrl("http://website.com/grechaw");
		return contributor;
	}
	

	public static void compareContributors(String message, Contributor c1,
			Contributor c2) {
		assertEquals(message, c1.getAboutMe(), c2.getAboutMe());
		assertEquals(message, c1.getId(), c2.getId());
		assertEquals(message, c1.getDisplayName(), c2.getDisplayName());
		assertEquals(message, c1.getWebsiteUrl(), c2.getWebsiteUrl());
	}
	

	public static Contributor maryUser;
	public static Contributor joeUser;

	static {
		joeUser = Utils.getBasicUser();
		joeUser.setDisplayName("joeUser");
		joeUser.setUserName("joeUser@marklogic.com");

		joeUser.setId(JoesUUID);

		maryUser = Utils.getBasicUser();
		maryUser.setDisplayName("maryUser");
		maryUser.setUserName("maryAdmin@marklogic.com");
		maryUser.setId(UUID.randomUUID());
	}

}
