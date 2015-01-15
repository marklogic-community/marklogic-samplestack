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

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.marklogic.client.FailedRequestException;
import com.marklogic.client.ForbiddenUserException;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.DocumentMetadataHandle.Capability;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.samplestack.dbclient.Clients;
import com.marklogic.samplestack.exception.SamplestackIOException;
import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.service.ContributorService;
import com.marklogic.samplestack.service.QnAService;

@Component
public class TestDataManager {

	public List<String> testC1QuestionIds;
	public List<String> testC1AnswerIds;
	public List<String> testA1QuestionIds;

	@Autowired
	private QnAService qnaService;

	@Autowired
	private ContributorService contributorService;

	public TestDataManager() {
		testC1QuestionIds = new ArrayList<String>();
		testC1AnswerIds = new ArrayList<String>();
		testA1QuestionIds = new ArrayList<String>();
	}

	protected final String[] uniqueWords = new String[] { "abyss", "balsamic",
			"chocolate", "denim", "effervesence" };

	protected final String[] uniqueTags = new String[] { "ada", "python",
			"javascrpt", "clojure", "database" };

	@Autowired
	protected Clients clients;

	protected void loadJson(String path, boolean withGuestPerms)
			throws ResourceNotFoundException, ForbiddenUserException,
			FailedRequestException, IOException {
		ClassPathResource resource = new ClassPathResource(path);
		JSONDocumentManager docMgr = clients.get(
				ClientRole.SAMPLESTACK_CONTRIBUTOR).newJSONDocumentManager();

		DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();

		if (withGuestPerms) {
			metadataHandle.withPermission("samplestack-guest", Capability.READ);
		}
		if (docMgr.exists("/" + path) == null) {
			docMgr.write("/" + path, metadataHandle, new InputStreamHandle(
					resource.getInputStream()));
		}
	}

	@PostConstruct
	public void setupSearchData() {
		try {
			loadJson("questions/20864442.json", false);
			loadJson("questions/20864445.json", true);
			loadJson("questions/20864449.json", false);
			loadJson("questions/01600486-60ea-4557-bcfc-9c10b06fb8cd.json",
					false);
			loadJson("questions/778d0b9c-419f-496a-a300-44815d79708e.json",
					false);
			loadJson("questions/8450f8a4-2782-4c8a-9fd9-b83bcacc5018.json",
					false);
			loadJson("questions/e3d54960-40f7-4d86-b503-31f14f3dfa12.json",
					false);
			loadJson("questions/fd044632-55eb-4c91-9300-7578cee12eb2.json",
					false);
			loadJson("questions/3410347b-abf0-4e1a-8aa8-f153207322eb.json",
					false);
			loadJson("questions/5dce8909-0972-4289-93cd-f2e8790a17fb.json",
					false);
			loadJson("questions/6c90b1cf-2cd8-4a8d-87ae-0c6d5182d300.json",
					true);
			
			loadJson("triples/testRdf.json", true);

		} catch (Exception e) {
			throw new SamplestackIOException(e);
		}

		/* for has voted */
		testC1QuestionIds.add("01600486-60ea-4557-bcfc-9c10b06fb8cd");
		testC1QuestionIds.add("6c90b1cf-2cd8-4a8d-87ae-0c6d5182d300");
		testC1QuestionIds.add("778d0b9c-419f-496a-a300-44815d79708d");
		testC1QuestionIds.add("fd044632-55eb-4c91-9300-7578cee12eb2");
		testC1QuestionIds.add("e3d54960-40f7-4d86-b503-31f14f3dfa12");
		testA1QuestionIds.add("3410347b-abf0-4e1a-8aa8-f153207322eb");
		testA1QuestionIds.add("5dce8909-0972-4289-93cd-f2e8790a17fb");
		testA1QuestionIds.add("8450f8a4-2782-4c8a-9fd9-b83bcacc5018");
		testC1AnswerIds.add("594d5815-3d28-40d2-b1b8-6401a79886ad");
		testC1AnswerIds.add("6432cc02-2770-4b8d-b5f1-0b632875f86d");
		testC1AnswerIds.add("ef376cf4-3a30-44af-b2c5-722e6439723e");

		contributorService.store(Utils.testC1);
		contributorService.store(Utils.testA1);

	}

	@PreDestroy
	public void teardownSearchData() throws ResourceNotFoundException,
			ForbiddenUserException, FailedRequestException, IOException {
		try {
			JSONDocumentManager docMgr = clients.get(
					ClientRole.SAMPLESTACK_CONTRIBUTOR)
					.newJSONDocumentManager();
			docMgr.delete("/questions/20864442.json");
			docMgr.delete("/questions/20864445.json");
			docMgr.delete("/questions/20864449.json");
			docMgr.delete("/questions/01600486-60ea-4557-bcfc-9c10b06fb8cd.json");
			docMgr.delete("/questions/778d0b9c-419f-496a-a300-44815d79708e.json");
			docMgr.delete("/questions/8450f8a4-2782-4c8a-9fd9-b83bcacc5018.json");
			docMgr.delete("/questions/e3d54960-40f7-4d86-b503-31f14f3dfa12.json");
			docMgr.delete("/questions/fd044632-55eb-4c91-9300-7578cee12eb2.json");
			docMgr.delete("/questions/3410347b-abf0-4e1a-8aa8-f153207322eb.json");
			docMgr.delete("/questions/5dce8909-0972-4289-93cd-f2e8790a17fb.json");
			docMgr.delete("/questions/6c90b1cf-2cd8-4a8d-87ae-0c6d5182d300.json");
			docMgr.delete("/triples/testRdf.json");
		} catch (Exception e) {
			throw new SamplestackIOException(e);
		}

		contributorService.delete(Utils.testC1UUID);
		contributorService.delete(Utils.testA1UUID);
		contributorService.delete(Utils.basicUserUUID);
	}

}
