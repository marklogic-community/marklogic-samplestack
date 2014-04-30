package com.marklogic.sampleStack.domain;

import java.net.URI;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name="triple", namespace=Triple.NS)
@XmlAccessorType(XmlAccessType.FIELD)
public final class Triple {
	
	public static final String NS = "http://marklogic.com/semantics";

	@XmlElement(namespace=Triple.NS)
	private URI subject;
	
	@XmlElement(namespace=Triple.NS)
	private URI predicate;
	
	@XmlAttribute
	private String type;
	
	@XmlElement(namespace=Triple.NS)
	private String object;

	public URI getSubject() {
		return subject;
	}

	public void setSubject(URI subject) {
		this.subject = subject;
	}

	public URI getPredicate() {
		return predicate;
	}

	public void setPredicate(URI predicate) {
		this.predicate = predicate;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getObject() {
		return object;
	}

	public void setObject(String object) {
		this.object = object;
	}
}
