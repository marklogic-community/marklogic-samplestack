package com.marklogic.samplestack.domain;

public class SparseQuestion {

	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getText() {
		return text;
	}
	public void setText(String body) {
		this.text = body;
	}
	public String[] getTags() {
		return tags;
	}
	public void setTags(String[] tags) {
		this.tags = tags;
	}
	private String title;
	private String text;
	private String[] tags;
	
}
