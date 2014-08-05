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
package com.marklogic.samplestack.service;

import com.marklogic.samplestack.domain.ClientRole;

/**
 * Defines the TagsService, which returns suggested tags based on substrings.
 */
public interface TagsService {

	/**
	 * Gets a list of tags with no supplied pattern. This list will start at the
	 * beginning of the alphabet.
	 * 
	 * @param role
	 *            the caller's role.
	 * @return An array of tags.
	 */
	public String[] suggestTags(ClientRole role);

	/**
	 * Gets a list of tags based on a suggestion pattern.
	 * 
	 * @param role
	 *            the caller's role.
	 * @param pattern
	 *            A substring pattern that will be matched for candidate tags.
	 * @return An array of tags containing the supplied pattern.
	 */
	public String[] suggestTags(ClientRole role, String pattern);

}
