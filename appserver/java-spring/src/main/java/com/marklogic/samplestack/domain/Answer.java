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
import java.util.List;

/**
 * Models an answer to a question.  Used by web tier for validating input.
 * 
 * @see com.marklogic.samplestack.domain.QnADocument
 */
public class Answer {

	public String id;
	public String text;
	public long itemTally;
	public List<Comment> comments;
	public SparseContributor owner;
	public Date creationDate;
	private String[] upvotingContributorIds;
	private String[] downvotingContributorIds;
	
	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public long getItemTally() {
		return itemTally;
	}
	public void setItemTally(long itemTally) {
		this.itemTally = itemTally;
	}
	public List<Comment> getComments() {
		return comments;
	}
	public void setComments(List<Comment> comments) {
		this.comments = comments;
	}
	public SparseContributor getOwner() {
		return owner;
	}
	public void setOwner(SparseContributor owner) {
		this.owner = owner;
	}
	public void setCreationDate(Date creationDate) {
		this.creationDate = creationDate;
	}
	public Date getCreationDate() {
		return this.creationDate;
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
