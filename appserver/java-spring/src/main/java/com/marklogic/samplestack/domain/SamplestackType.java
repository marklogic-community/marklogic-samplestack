package com.marklogic.samplestack.domain;

/** 
 * To configure server-side configurations of types
 * and their corresponding queries, this enum
 * divides the Samplestack objects into "contributors"
 * which are stored in the /contributors/ directory
 * and use "contributors" search options,
 * and "questions" which are stored in /questions/ and
 * use the "questions" options name for searches.
 * @author cgreer
 *
 */
public enum SamplestackType {

	QUESTIONS, CONTRIBUTORS;
	
	public String directoryName() {
		return "/" + this.toString().toLowerCase() + "/";
	}
	
	public String optionsName() {
		return this.toString().toLowerCase();
	}

}
