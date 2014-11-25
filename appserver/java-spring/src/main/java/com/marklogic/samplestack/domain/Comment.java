package com.marklogic.samplestack.domain;

import java.util.Date;

/**
 * Models a comment added to a question or answer.
 * @see com.marklogic.samplestack.domain.QnADocument
 */
public class Comment {

	private SparseContributor owner;
	private String text;
	private Date creationDate;
	public SparseContributor getOwner() {
		return owner;
	}
	public void setOwner(SparseContributor owner) {
		this.owner = owner;
	}
	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}
	public Date getCreationDate() {
		return creationDate;
	}
	public void setCreationDate(Date creationDate) {
		this.creationDate = creationDate;
	}
}
