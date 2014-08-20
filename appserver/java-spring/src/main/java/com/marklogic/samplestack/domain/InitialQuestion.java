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
	
	private Answer[] answers;
	
	private Comment[] comments;
	
	private Date creationDate;
	
	private String id;
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}

	private long docScore;
	private long itemTally;
	
	private Date lastActivityDate;
	private SparseContributor owner;
	
	/** A string array of tags associated with this question */
	private String[] tags;
	@NotNull
	/** The markdown text of the question */
	private String text;
	
	
	@NotNull
	/** The title of the question */
	private String title;
	public InitialQuestion() {
		this.tags = new String[] {};
		this.comments = new Comment[] {};
		this.answers = new Answer[] {};
		this.docScore = 0L;
		this.itemTally = 0L;
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
	public long getDocScore() {
		return docScore;
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
	public void setAnswers(Answer[] answers) {
		this.answers = answers;
	}
	public void setComments(Comment[] comments) {
		this.comments = comments;
	}
	public void setCreationDate(Date creationDate) {
		this.creationDate = creationDate;
	}
	public void setDocScore(long docScore) {
		this.docScore = docScore;
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
	
	public void updateLastActivityDate() {
		this.lastActivityDate = new Date();
	}
	
}
