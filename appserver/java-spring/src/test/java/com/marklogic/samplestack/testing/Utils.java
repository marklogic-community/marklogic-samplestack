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
package com.marklogic.samplestack.testing;

import static org.junit.Assert.assertEquals;

import com.marklogic.samplestack.domain.Contributor;

/**
 * Testing utilities, especially for making stock Contributor objects.
 */
public class Utils {
	
	
	public static String basicUserUUID = "779b383c-dbf3-4008-b9d8-64f0491f1d4a";
	public static String JoesUUID = "cf99542d-f024-4478-a6dc-7e723a51b040";
	public static String MarysUUID = "9611450-0663-45a5-8a08-f1c71320475e";

	public static Contributor getBasicUser() {
		Contributor contributor = new Contributor();
		contributor.setAboutMe("Some text about a basic user");
		contributor.setId(basicUserUUID);
		contributor.setUserName("cgreer@marklogic.com");
		contributor.setDisplayName("grechaw");
		contributor.setWebsiteUrl("http://website.com/grechaw");
		contributor.setLocation("Barrow");
		contributor.setReputation(0);
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
		maryUser.setId(MarysUUID);
	}

}
