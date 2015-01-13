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
package com.marklogic.samplestack.domain;

import java.util.Date;

import javax.validation.constraints.NotNull;

/**
 * A POJO to represent the information provided when a contributor first asks a question.
 * After the initial object generation, this domain model is managed as JSON documents, 
 * not POJOs.
 * @see com.marklogic.samplestack.domain.QnADocument
 */
public class InitialQuestion {
	
	private Boolean accepted;
	private String acceptedAnswerId;
	private long answerCount;
	private Answer[] answers;
	private Comment[] comments;
	private Date creationDate;
	private String id;
	/** The total of the up and down votes on this question (without answers) */
	private long itemTally;
	/** The last time this question was updated */
	private Date lastActivityDate;
	/** A few data fields having to do with the owner of this question */
	private SparseContributor owner;
	/** A string array of tags associated with this question */
	private String[] tags;
	@NotNull
	/** The markdown text of the question */
	private String text;
	@NotNull
	/** The title of the question */
	private String title;

	/** The total number of votes on this question-and-answer document */
	private long voteCount;
	
	/** An array of Ids that track who has voted "up" on this question */
	private String[] upvotingContributorIds;
	
	/** An array of Ids that track who have voted "down" on this question */
	private String[] downvotingContributorIds;
	
	
	public InitialQuestion() {
		this.tags = new String[] {};
		this.comments = new Comment[] {};
		this.answers = new Answer[] {};
		this.voteCount = 0L;
		this.itemTally = 0L;
		this.accepted = false;
		this.answerCount = 0L;
		this.setUpvotingContributorIds(new String[] {});
		this.setDownvotingContributorIds(new String[] {});
	}
	public Boolean getAccepted() {
		return accepted;
	}
	public String getAcceptedAnswerId() {
		return acceptedAnswerId;
	}
	public long getAnswerCount() {
		return answerCount;
	}
	public Answer[] getAnswers() {
		return answers;
	}
	public Comment[] getComments() {
		return comments;
	}
	public Date getCreationDate() {
		return creationDate;
	}
	public String getId() {
		return id;
	}
	public long getItemTally() {
		return itemTally;
	}
	public Date getLastActivityDate() {
		return lastActivityDate;
	}
	public SparseContributor getOwner() {
		return this.owner;
	}
	public String[] getTags() {
		return tags;
	}
	public String getText() {
		return text;
	}
	public String getTitle() {
		return title;
	}
	public long getVoteCount() {
		return voteCount;
	}
	public void setAccepted(Boolean accepted) {
		this.accepted = accepted;
	}
	public void setAcceptedAnswerId(String acceptedAnswerId) {
		this.acceptedAnswerId = acceptedAnswerId;
	}
	public void setAnswerCount(long answerCount) {
		this.answerCount = answerCount;
	}
	public void setAnswers(Answer[] answers) {
		this.answers = answers;
	}
	public void setComments(Comment[] comments) {
		this.comments = comments;
	}
	public void setCreationDate(Date creationDate) {
		this.creationDate = creationDate;
	}
	public void setId(String id) {
		this.id = id;
	}
	public void setItemTally(long itemTally) {
		this.itemTally = itemTally;
	}
	
	public void setLastActivityDate(Date lastActivityDate) {
		this.lastActivityDate = lastActivityDate;
	}
	
	public void setOwner(SparseContributor owner) {
		this.owner = owner;
	}
	public void setTags(String[] tags) {
		this.tags = tags;
	}
	public void setText(String text) {
		this.text = text;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public void setVoteCount(long voteCount) {
		this.voteCount = voteCount;
	}
	public void updateLastActivityDate() {
		this.lastActivityDate = new Date();
	}
	public String[] getUpvotingContributorIds() {
		return upvotingContributorIds;
	}
	public void setUpvotingContributorIds(String[] upvotingContributorIds) {
		this.upvotingContributorIds = upvotingContributorIds;
	}
	public String[] getDownvotingContributorIds() {
		return downvotingContributorIds;
	}
	public void setDownvotingContributorIds(String[] downvotingContributorIds) {
		this.downvotingContributorIds = downvotingContributorIds;
	}
}
