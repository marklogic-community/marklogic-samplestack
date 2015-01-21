/*
 * Copyright 2012-2015 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
	public static final String SEARCH_RESPONSE_TRANSFORM = "search-response";
	

	/**
	 * The single question response page uses these search options:
	 */
	public static final String SINGLE_QUESTION_TRANSFORM = "single-question";

	
	public static String ISO_8601_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSZZZZ";
	
	/**
	 * A formatter used to make dateTime strings in JSON serializations
	 */
	public static class ISO8601Formatter {
		public static String format(Date date) {
			return new SimpleDateFormat(ISO_8601_FORMAT).format(date);
		}
	}

}
