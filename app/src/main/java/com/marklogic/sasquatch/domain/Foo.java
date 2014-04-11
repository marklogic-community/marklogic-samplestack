package com.marklogic.sasquatch.domain;

import java.util.Date;

import javax.xml.bind.annotation.XmlRootElement;

/**
 * A Foo has no practical utility -- it is just 
 * here to illustrate a Java Object and how it can be stored 
 * and queried in MarkLogic, and served as JSON to the front-
 * end application.
 */
@XmlRootElement
public class Foo {

	private String name;
	private Long id;
	private Date startDate;
	private Double doubleValue;
	private String point;

	public Foo() {
		
	}
	
	public Foo(Long id, String name) {
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
	public void setId(Long l) {
		this.id = l;
	}
	public Date getStartDate() {
		return startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}

	
	public Double getDoubleValue() {
		return doubleValue;
	}

	public void setDoubleValue(Double doubleValue) {
		this.doubleValue = doubleValue;
	}

	public String getPoint() {
		return point;
	}

	public void setPoint(String point) {
		this.point = point;
	}
	
}
