package com.marklogic.samplestack;

import java.text.SimpleDateFormat;
import java.util.Date;


/**
 * Various application or database- related constants in the application.
 */
public class SamplestackConstants {


	public static final String QUESTIONS_DIRECTORY = "/questions/";
	public static final String QUESTIONS_OPTIONS = "questions";
	
	public static final String CONTRIBUTORS_OPTIONS = "contributors";
	public static final int RESULTS_PAGE_LENGTH = 10;

	public static final String SEARCH_RESPONSE_TRANSFORM = "search-response-xqy";
	
	public static String ISO_8601_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS";
	public static class ISO8601Formatter {
		public static String format(Date date) {
			return new SimpleDateFormat(ISO_8601_FORMAT).format(date);
		}
	}

}
