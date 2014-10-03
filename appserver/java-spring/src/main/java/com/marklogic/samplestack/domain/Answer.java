package com.marklogic.samplestack.domain;

import java.util.Date;
import java.util.List;

public class Answer {

	public String id;
	public String text;
	public long itemTally;
	public List<Comment> comments;
	public SparseContributor owner;
	public Date creationDate;
	
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
}
