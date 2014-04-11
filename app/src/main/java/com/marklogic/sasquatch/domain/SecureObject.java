package com.marklogic.sasquatch.domain;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class SecureObject {

	// some piece of data
	String data;
	
	// the URI of some other document I'm interested in.
	String annotatesDocument;

	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
	}

	public String getAnnotatesDocument() {
		return annotatesDocument;
	}

	public void setAnnotatesDocument(String annotatesDocument) {
		this.annotatesDocument = annotatesDocument;
	}
	
}
