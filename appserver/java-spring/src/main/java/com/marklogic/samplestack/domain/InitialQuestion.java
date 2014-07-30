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

import javax.validation.constraints.NotNull;

/**
 * A POJO to represent the information provided when a contributor first asks a question
 *
 */
public class InitialQuestion {
	
	@NotNull
	/** The title of the question */
	private String title;
	
	@NotNull
	/** The markdown text of the question */
	private String text;
	
	/** A string array of tags associated with this question */
	private String[] tags;
	
	
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
	
	
}
