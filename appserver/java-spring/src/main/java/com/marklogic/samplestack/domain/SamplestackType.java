/*
 * Copyright 2012-2014 MarkLogic Corporation
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
package com.marklogic.samplestack.domain;

/** 
 * To configure server-side configurations of types
 * and their corresponding queries, this enum
 * divides the Samplestack objects into "contributors"
 * which are stored in the /contributors/ directory
 * and use "contributors" search options,
 * and "questions" which are stored in /questions/ and
 * use the "questions" options name for searches.
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
