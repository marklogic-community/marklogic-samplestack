package com.marklogic.samplestack.unit.domain;

import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;

import org.json.JSONException;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.skyscreamer.jsonassert.JSONAssert;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.samplestack.domain.DateFacetBuilder;
import com.marklogic.samplestack.impl.CustomObjectMapper;
import com.marklogic.samplestack.testing.UnitTests;

@Category(UnitTests.class)
public class DateFacetBuilderTest {
	
	
	
	@Test
	public void testBuilder() throws JsonProcessingException, JSONException {
		ObjectMapper mapper = new CustomObjectMapper();
		long oneWeek = 60 * 60 * 1000 * 24 * 7;
		Calendar calendar = new GregorianCalendar(2013,0,31);
		Date minDate = calendar.getTime();
		Date maxDate = new Date(minDate.getTime() + oneWeek);
		
		String actual = mapper.writeValueAsString(
				DateFacetBuilder.dateFacet(2, minDate, maxDate));
		String expected = "{constraint:{name:\"lastActivityDate\",type:\"xs:dateTime\",facet:true,bucket:["
				+ "{lt:\"2013-02-03T12:00:00.000\",ge:\"2013-01-31T00:00:00.000\",label:\"2013-01-31T00:00:00.000-2013-02-03T12:00:00.000\",name:\"0\"},"
				+ "{ge:\"2013-02-03T12:00:00.000\",lt:\"2013-02-07T00:00:00.000\",label:\"2013-02-03T12:00:00.000-2013-02-07T00:00:00.000\",name:\"1\"},"
				+ "]}}";
		JSONAssert.assertEquals(actual, expected, false);	
	}
}
