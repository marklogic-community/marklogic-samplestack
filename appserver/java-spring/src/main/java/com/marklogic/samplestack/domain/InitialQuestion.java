package com.marklogic.samplestack.domain;

import java.util.ArrayList;

import javax.validation.constraints.NotNull;

public class InitialQuestion {

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
	
	public InitialQuestion() {
		this.tags = new String[] {};
	}
	
	@NotNull
	private String title;
	
	@NotNull
	private String text;
	
	private String[] tags;
	
}
