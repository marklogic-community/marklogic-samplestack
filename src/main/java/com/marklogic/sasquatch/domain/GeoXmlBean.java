package com.marklogic.sasquatch.domain;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class GeoXmlBean {

	String point;

	public String getPoint() {
		return point;
	}

	public void setPoint(String point) {
		this.point = point;
	}
	
}
