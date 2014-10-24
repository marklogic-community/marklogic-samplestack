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
package com.marklogic.samplestack.web;

import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.marklogic.samplestack.security.ClientRole;
import com.marklogic.samplestack.service.HasVotedService;

/**
 * Controller that exposes endpoint for tags support.
 */
@RestController
public class HasVotedController {

	@Autowired
	private HasVotedService hasVotedService;

	@SuppressWarnings("unused")
	private final Logger logger = LoggerFactory.getLogger(HasVotedController.class);

	/**
	 * Exposes the tags endpoint, which provides suggestions based on the request parameter.
	 * @param q A query pattern
	 * @return A list of tags as Strings.
	 */
	@RequestMapping(value = "hasVoted", method = RequestMethod.GET)
	public @ResponseBody
	Set<String> hasVoted(@RequestParam(required = true) String contributorId,
			@RequestParam(required = true) String questionId) {
		return hasVotedService.hasVoted(ClientRole.securityContextRole(), contributorId, questionId);
	}
}
