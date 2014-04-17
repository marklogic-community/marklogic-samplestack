package com.marklogic.sampleStack.domain;

import java.net.URI;
import java.util.Date;
import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class DocumentTag {

	
	private String userName;
	private String tagName;
	private Date createdAt;
	private URI conceptUri;
	
	public String getTagName() {
		return tagName;
	}

	public void setTagName(String tagName) {
		this.tagName = tagName;
	}


	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public URI getConceptUri() {
		return conceptUri;
	}

	public void setConceptUri(URI conceptUri) {
		this.conceptUri = conceptUri;
	}

	
	@XmlElement(name = "triple", namespace="http://marklogic.com/semantics")
	private List<Triple> triples;

	public List<Triple> getTriples() {
		return triples;
	}

	public void setTriples(List<Triple> triples) {
		this.triples = triples;
	}

	public Date getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Date createdAt) {
		this.createdAt = createdAt;
	}

}
