package com.marklogic.sasquatch.domain;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class FooBean {

	private String name;
	private Long id;
	
	public FooBean() {
		
	}
	
	public FooBean(Long id, String name) {
		this.id = id;
		this.name = name;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Long getId() {
		return id;
	}
	public void setId(long l) {
		this.id = l;
	}
	
}
