package com.marklogic.sasquatch.domain;

import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class GithubTag {

	private String tagName;
	
	public String getTagName() {
		return tagName;
	}

	public void setTagName(String tagName) {
		this.tagName = tagName;
	}

	

	@XmlElement(name = "triple", namespace="http://marklogic.com/semantics")
	private List<TripleBean> triples;

	public List<TripleBean> getTriples() {
		return triples;
	}

	public void setTriples(List<TripleBean> triples) {
		this.triples = triples;
	}

}
