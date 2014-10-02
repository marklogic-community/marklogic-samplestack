package com.marklogic.samplestack.impl;

import org.joda.time.DateTime;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

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
	
	/** This interval is used for calculations to make buckets */
	public enum BucketInterval { 
		BY_DAY,
		BY_WEEK,
		BY_MONTH;

		/** returns (approximate) the bucket duration in milliseconds */
		public long bucketDuration() {
			if (this == BY_DAY) {
				return 1000 * 60 * 60 * 24;
			}
			else if (this == BY_WEEK) {
				return 1000 * 60 * 60 * 24 * 7;
			}
			else {
				// by month
				return 1000 * 60 * 60 * 24 * 30;
			}
		}
	};

	private ObjectNode facetNode;
	private ObjectNode constraintNode;
	private ArrayNode bucketNode;
	
	public DateFacetBuilder(ObjectMapper mapper) {
		this.facetNode = mapper.createObjectNode();
		this.constraintNode = facetNode.putObject("constraint");
		ObjectNode rangeNode = this.constraintNode.putObject("range");
		rangeNode.put("type", "xs:dateTime");
		rangeNode.put("facet", true);
		rangeNode.put("json-property", "lastActivityDate");
		rangeNode.put("facet-option", "empties");
		this.bucketNode = rangeNode.putArray("bucket");
	}

	private DateFacetBuilder name(String name) {
		this.constraintNode.put("name", name);
		return this;
	}

	private DateFacetBuilder bucket(DateTime ge, DateTime lt) {
		ObjectNode thisBucket = this.bucketNode.addObject();
		thisBucket.put("ge", ge.toString());
		thisBucket.put("lt", lt.toString());
		thisBucket.put("name", ge.toString());
		thisBucket.put("label", ge.toString());
		return this;
	}
	
	public static ObjectNode dateFacet(DateTime min, DateTime max) {
		DateFacetBuilder fb = new DateFacetBuilder(new CustomObjectMapper());
		fb.name("date");
		long interval = max.getMillis() - min.getMillis();
		if (interval / BucketInterval.BY_DAY.bucketDuration() < 40) {
			DateTime bucketStart = min.minus(min.getMillisOfDay());
			while (bucketStart.isBefore(max)) {
				DateTime bucketEnd = bucketStart.plusDays(1);
				fb.bucket(bucketStart, bucketEnd);
				bucketStart = bucketStart.plusDays(1);
			}
		}
		else if (interval / BucketInterval.BY_WEEK.bucketDuration() < 40) {
			DateTime bucketStart = min.minusDays(min.getDayOfWeek()).minus(min.getMillisOfDay());
			while (bucketStart.isBefore(max)) {
				DateTime bucketEnd = bucketStart.plusWeeks(1);
				fb.bucket(bucketStart, bucketEnd);
				bucketStart = bucketStart.plusWeeks(1);
			}
		} else {
			DateTime bucketStart = min.minusDays(min.getDayOfMonth()).minus(min.getMillisOfDay());
			while (bucketStart.isBefore(max)) {
				DateTime bucketEnd = bucketStart.plusMonths(1);
				fb.bucket(bucketStart, bucketEnd);
				bucketStart = bucketStart.plusMonths(1);
			}
		}
		
		
		return fb.facetNode;
	}
}
