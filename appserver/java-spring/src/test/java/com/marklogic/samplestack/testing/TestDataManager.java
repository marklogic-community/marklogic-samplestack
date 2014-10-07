package com.marklogic.samplestack.testing;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

import org.junit.Test;
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
import com.marklogic.samplestack.domain.ClientRole;
import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.domain.InitialQuestion;
import com.marklogic.samplestack.exception.SamplestackIOException;
import com.marklogic.samplestack.impl.Clients;
import com.marklogic.samplestack.service.ContributorService;
import com.marklogic.samplestack.service.QnAService;

@Component
public class TestDataManager {

	public List<String> joesQuestionIds;
	public List<String> joesAnswerIds;
	public List<String> marysQuestionIds;

	@Autowired
	private QnAService qnaService;
	
	@Autowired
	private ContributorService contributorService;

	public TestDataManager() {
		joesQuestionIds = new ArrayList<String>();
		joesAnswerIds = new ArrayList<String>();
		marysQuestionIds = new ArrayList<String>();
	}

	
	protected final String[] uniqueWords = new String[] { "abyss", "balsamic",
			"chocolate", "denim", "effervesence" };

	protected final String[] uniqueTags = new String[] { "ada", "python", "javascrpt",
			"clojure", "database" };

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
		contributorService.store(Utils.joeUser);
		contributorService.store(Utils.maryAdmin);
		
		try {
			loadJson("questions/20864442.json", false);
			loadJson("questions/20864445.json", true);
			loadJson("questions/20864449.json", false);
			loadJson("questions/01600486-60ea-4557-bcfc-9c10b06fb8cd.json",
					false);
			loadJson("questions/778d0b9c-419f-496a-a300-44815d79708d.json",
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

		} catch (Exception e) {
			throw new SamplestackIOException(e);
		}

        /* for has voted */
        joesQuestionIds.add("01600486-60ea-4557-bcfc-9c10b06fb8cd");
        joesQuestionIds.add("6c90b1cf-2cd8-4a8d-87ae-0c6d5182d300");
        joesQuestionIds.add("778d0b9c-419f-496a-a300-44815d79708d");
        joesQuestionIds.add("fd044632-55eb-4c91-9300-7578cee12eb2");
        joesQuestionIds.add("e3d54960-40f7-4d86-b503-31f14f3dfa12");
        marysQuestionIds.add("3410347b-abf0-4e1a-8aa8-f153207322eb");
        marysQuestionIds.add("5dce8909-0972-4289-93cd-f2e8790a17fb");
        marysQuestionIds.add("8450f8a4-2782-4c8a-9fd9-b83bcacc5018");
        joesAnswerIds.add("594d5815-3d28-40d2-b1b8-6401a79886ad");
        joesAnswerIds.add("6432cc02-2770-4b8d-b5f1-0b632875f86d");
        joesAnswerIds.add("ef376cf4-3a30-44af-b2c5-722e6439723e");


	}

	@PreDestroy
	public void teardownSearchData() throws ResourceNotFoundException,
			ForbiddenUserException, FailedRequestException, IOException {
		try {
			JSONDocumentManager docMgr = clients.get(ClientRole.SAMPLESTACK_CONTRIBUTOR).newJSONDocumentManager();
			docMgr.delete("/questions/20864442.json");
			docMgr.delete("/questions/20864445.json");
			docMgr.delete("/questions/20864449.json");
            docMgr.delete("/questions/01600486-60ea-4557-bcfc-9c10b06fb8cd.json");
            docMgr.delete("/questions/778d0b9c-419f-496a-a300-44815d79708d.json");
            docMgr.delete("/questions/8450f8a4-2782-4c8a-9fd9-b83bcacc5018.json");
            docMgr.delete("/questions/e3d54960-40f7-4d86-b503-31f14f3dfa12.json");
            docMgr.delete("/questions/fd044632-55eb-4c91-9300-7578cee12eb2.json");
            docMgr.delete("/questions/3410347b-abf0-4e1a-8aa8-f153207322eb.json");
            docMgr.delete("/questions/5dce8909-0972-4289-93cd-f2e8790a17fb.json");
            docMgr.delete("/questions/6c90b1cf-2cd8-4a8d-87ae-0c6d5182d300.json");
		} catch (Exception e) {
			throw new SamplestackIOException(e);
		}

		contributorService.delete(Utils.joeUser.getId());
		contributorService.delete(Utils.maryAdmin.getId());	
		Contributor toDelete = contributorService.getByUserName("grechaw@marklogic.com");
		if (toDelete != null) {
			contributorService.delete(toDelete.getId());
		}

		toDelete = contributorService.getByUserName("cgreer@marklogic.com");
		if (toDelete != null) {
			contributorService.delete(toDelete.getId());
		}
	}
	
	/**
	 * Test data builder Requirements specify some specific participation of
	 * joeUser. This method generates documents such that:
	 * 
	 * joe asks 5 questions joe contributes three answers. joe has made two
	 * comments joe has received five votes joe has voted three times.
	 * 
	 * This method can be used to generate data; however for unit testing speed
	 * the output of this function is saved to src/test/resources/questions
	 * 
	 */
	public void generateTestCorpus() {
		if (qnaService == null) {
			return;
			// skip -- database context tests don't use this.
		}
		for (int i = 0; i < 5; i++) {
			// ask five questions
			InitialQuestion question = new InitialQuestion();
			question.setTitle("Joe's Question Number " + i);
			question.setText("I had a question about the word "
					+ uniqueWords[i] + " and the number " + i);
			question.setTags(new String[] { uniqueTags[i] });
			joesQuestionIds
					.add(qnaService.ask(Utils.joeUser, question).getId());
		}

		for (int i = 0; i < 3; i++) {
			// mary asks three so joe can answer.
			InitialQuestion question = new InitialQuestion();
			question.setTitle("Mary's Question Number " + i);
			question.setText("I, Mary, had a question about the word "
					+ uniqueWords[i] + " and the number " + i);
			question.setTags(new String[] { uniqueTags[i] });
			marysQuestionIds.add(qnaService.ask(Utils.maryAdmin, question)
					.getId());
		}

		joesAnswerIds.add(qnaService.answer(Utils.joeUser,
				marysQuestionIds.get(0), "My first answer to a question")
				.getId());
		joesAnswerIds.add(qnaService.answer(Utils.joeUser,
				marysQuestionIds.get(1), "My second answer to a question")
				.getId());
		joesAnswerIds.add(qnaService.answer(Utils.joeUser,
				marysQuestionIds.get(2), "My third answer to a question")
				.getId());

		qnaService.voteUp(Utils.maryAdmin, joesQuestionIds.get(0));
		qnaService.voteDown(Utils.maryAdmin, joesQuestionIds.get(1));
		qnaService.voteUp(Utils.maryAdmin, joesQuestionIds.get(2));
		qnaService.voteDown(Utils.maryAdmin, joesAnswerIds.get(0));
		qnaService.voteUp(Utils.maryAdmin, joesAnswerIds.get(1));
		qnaService.voteUp(Utils.joeUser, marysQuestionIds.get(0));
		qnaService.voteDown(Utils.joeUser, marysQuestionIds.get(1));
		qnaService.voteDown(Utils.joeUser, marysQuestionIds.get(2));

		qnaService.comment(Utils.joeUser, marysQuestionIds.get(0),
				"This question is ludicrous.");
		qnaService.comment(Utils.joeUser, marysQuestionIds.get(1),
				"This question is insightful.");

		// one accepted question
		qnaService.accept(joesAnswerIds.get(0));
		
	}
}
