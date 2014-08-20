package com.marklogic.samplestack.domain;

import static com.marklogic.samplestack.SamplestackConstants.ISO8601Formatter;

import java.util.Date;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.samplestack.impl.CustomObjectMapper;

/**
 * A builder for date buckets, to make dynamically-generated
 * time-series histograms.
 * 
 * {constraint:{
 *   name:name,
 *   type:xs:dateTime,
 *   facet:true,
 *   bucket:[
 *   ]
 *   }
 */
public class DateFacetBuilder {
	
	private ObjectNode facetNode;
	private ObjectNode constaintNode;
	private ArrayNode bucketNode;
	
	public DateFacetBuilder(ObjectMapper mapper) {
		this.facetNode = mapper.createObjectNode();
		this.constaintNode = facetNode.putObject("constraint");
		this.constaintNode.put("type", "xs:dateTime");
		this.constaintNode.put("facet", true);
		this.bucketNode = constaintNode.putArray("bucket");
	}
	
	private DateFacetBuilder name(String name) {
		this.constaintNode.put("name", name);
		return this;
	}

	private DateFacetBuilder bucket(Date ge, Date lt, String name, String label) {
		ObjectNode thisBucket = this.bucketNode.addObject();
		thisBucket.put("ge", ISO8601Formatter.format(ge));
		thisBucket.put("lt", ISO8601Formatter.format(lt));
		thisBucket.put("name", name);
		thisBucket.put("label", label);
		return this;
	}
	
	public static ObjectNode dateFacet(int nBuckets, Date min, Date max) {
		DateFacetBuilder fb = new DateFacetBuilder(new CustomObjectMapper());
		long interval = max.getTime() - min.getTime();
		long bucketSize = interval / nBuckets;
		int i = 0;
		for (long dateInterval = min.getTime(); dateInterval < max.getTime(); dateInterval += bucketSize, i++) {
			Date lower = new Date(dateInterval);
			Date upper = new Date(dateInterval + bucketSize);
			String label = ISO8601Formatter.format(lower) + "-" + ISO8601Formatter.format(upper);
			fb.name("lastActivityDate").bucket(lower, upper, Integer.toString(i), label);
		}
		return fb.facetNode;
	}
}
