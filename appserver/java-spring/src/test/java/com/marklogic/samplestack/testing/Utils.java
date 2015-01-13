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
package com.marklogic.samplestack.testing;

import static org.junit.Assert.assertEquals;

import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.InitialQuestion;

/**
 * Testing utilities, especially for making stock Contributor objects.
 */
public class Utils {
	
	public static String basicUserUUID = "779b383c-dbf3-4008-b9d8-64f0491f1d4a";
	public static String testC1UUID =    "cf99542d-f024-4478-a6dc-7e723a51b041";
	public static String testA1UUID =    "9611450a-0663-45a5-8a08-f1c71320475f";

	public static Contributor getBasicUser() {
		Contributor contributor = new Contributor();
		contributor.setAboutMe("Some text about a basic user");
		contributor.setId(basicUserUUID);
		contributor.setUserName("cgreer@example.com");
		contributor.setDisplayName("grechaw");
		contributor.setWebsiteUrl("http://website.com/grechaw");
		contributor.setLocation("Barrow");
		contributor.setReputation(10);
		contributor.setVoteCount(0);
		return contributor;
	}
	

	public static void compareContributors(String message, Contributor c1,
			Contributor c2) {
		assertEquals(message, c1.getAboutMe(), c2.getAboutMe());
		assertEquals(message, c1.getId(), c2.getId());
		assertEquals(message, c1.getDisplayName(), c2.getDisplayName());
		assertEquals(message, c1.getWebsiteUrl(), c2.getWebsiteUrl());
	}
	

	public static Contributor testA1;
	public static Contributor testC1;

	static {
		testC1 = Utils.getBasicUser();
		testC1.setDisplayName("testC1");
		testC1.setUserName("testC1@example.com");

		testC1.setId(testC1UUID);
		testC1.setVoteCount(3);
//		testC1.getVotes().put("5dce8909-0972-4289-93cd-f2e8790a17fb", 1);
//		testC1.getVotes().put("8450f8a4-2782-4c8a-9fd9-b83bcacc5018", -1);
//		testC1.getVotes().put("3410347b-abf0-4e1a-8aa8-f153207322eb", 1);

		testA1 = Utils.getBasicUser();
		testA1.setDisplayName("testA1");
		testA1.setUserName("testA1@example.com");
		testA1.setId(testA1UUID);
		testA1.setVoteCount(5);
//		testA1.getVotes().put("778d0b9c-419f-496a-a300-44815d79708d", -1);
//		testA1.getVotes().put("6c90b1cf-2cd8-4a8d-87ae-0c6d5182d300", 1);
//		testA1.getVotes().put("594d5815-3d28-40d2-b1b8-6401a79886ad", 1);
//		testA1.getVotes().put("6432cc02-2770-4b8d-b5f1-0b632875f86d", 1);
//		testA1.getVotes().put("01600486-60ea-4557-bcfc-9c10b06fb8cd", -1);

	}

	public static InitialQuestion newQuestion() {
		InitialQuestion q = new InitialQuestion();
		q.setTitle("How do I get to know MarkLogic quickly?");
		q.setText("I mean, there are several reasons. \n* bullet\n*bullet And so it goes.");
		q.setTags(new String[] {"xquery", "javascript", "programming"});
		return q;
	}

}
