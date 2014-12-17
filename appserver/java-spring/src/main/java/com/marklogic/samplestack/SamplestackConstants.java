package com.marklogic.samplestack;

import java.text.SimpleDateFormat;
import java.util.Date;


/**
 * Various application or database- related constants in the application.
 */
public class SamplestackConstants {

	
	/**
	 * QnADocuments are stored with url pattern "/questions/{id}";
	 */
	public static final String QUESTIONS_DIRECTORY = "/questions/";
	
	/**
	 * The main search response uses the "questions" options name.
	 */
	public static final String QUESTIONS_OPTIONS = "questions";
	
	/**
	 * The single question response page uses these search options:
	 */
	public static final String SINGLE_QUESTION_OPTIONS = "single-question";

	/**
	 * Contributor queries use this options configuration.
	 */
	public static final String CONTRIBUTORS_OPTIONS = "contributors";
	
	/**
	 * Search results have a page length of ten.
	 */
	public static final int RESULTS_PAGE_LENGTH = 10;

	/**
	 * The name of the search transform used for search responses.
	 */
	public static final String SEARCH_RESPONSE_TRANSFORM = "search-response-xqy";
	

	/**
	 * The single question response page uses these search options:
	 */
	public static final String SINGLE_QUESTION_TRANSFORM = "single-question";

	
	public static String ISO_8601_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS";
	
	/**
	 * A formatter used to make dateTime strings in JSON serializations
	 */
	public static class ISO8601Formatter {
		public static String format(Date date) {
			return new SimpleDateFormat(ISO_8601_FORMAT).format(date);
		}
	}

}
