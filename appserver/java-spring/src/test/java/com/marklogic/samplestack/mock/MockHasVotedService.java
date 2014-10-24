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
package com.marklogic.samplestack.mock;

import java.util.HashSet;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.service.HasVotedService;

@Component
/**
 * A mocked implementation of HasVotedService for unit testing.
 */
public class MockHasVotedService implements HasVotedService {

	@Override
	public Set<String> hasVoted(ClientRole role, String contributorId,
			String postId) {
		Set<String> returnValue = new HashSet<String>();
		returnValue.add("1");
		returnValue.add("2");
		return returnValue;
	}


}
