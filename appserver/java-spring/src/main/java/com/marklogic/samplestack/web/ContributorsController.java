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

import java.util.List;
import java.util.Random;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.marklogic.samplestack.domain.Contributor;
import com.marklogic.samplestack.service.ContributorService;

/**
 * Provides HTTP access to contributor objects. Contributors are the
 * applications users whose content makes up a samplestack corpus. This controller
 * exposes a typical CRUD interface to POJOs. 
 */
@Controller
public class ContributorsController {

	static Random random = new Random();

	@Autowired
	private ContributorService service;

	/**
	 * Lists contributors, based on an optional query string.
	 * @param q An optional query string to filter contributors.
	 * @return A List of contributors, serialized as the response body.
	 */
	@RequestMapping(value = "contributors", method = RequestMethod.GET)
	public @ResponseBody
	@PreAuthorize("hasRole('ROLE_CONTRIBUTORS')")
	List<Contributor> listContributors(@RequestParam(required = false) String q) {
		if (q == null) {
			return service.list(0);
		} else {
			return service.search(q);
		}
	}

	/**
	 * Gets a single contributor object from the database.
	 * @param id The id of the contributor to fetch
	 * @return The JSON serialization of a contributor in the response body.
	 */
	@RequestMapping(value = "contributors/{id}", method = RequestMethod.GET)
	public @ResponseBody
	@PreAuthorize("hasRole('ROLE_CONTRIBUTORS')")
	Contributor get(@PathVariable("id") String id) {
		return service.get(id);
	}

	/**
	 * Creates a new contributor based on data in the request body
	 * @param contributor The request body, marshalled into a Contributor object.
	 * @return The newly persisted Contributor, with automated data added.
	 */
	@RequestMapping(value = "contributors", method = RequestMethod.POST)
	public @ResponseBody
	@PreAuthorize("hasRole('ROLE_ADMINS')")
	@ResponseStatus(HttpStatus.CREATED)
	Contributor newContributor(@RequestBody Contributor contributor) {
		contributor.setId(UUID.randomUUID().toString());
		service.store(contributor);
		return contributor;
	}

	/**
	 * Replaces the contributor object with new data from the request body.
	 * @param id The id of the contributor to replace.  Must match the id in the body.
	 * @param contributor The new data for this contributor object.
	 * @return The modified contributor.
	 */
	@RequestMapping(value = "contributors/{id}", method = RequestMethod.PUT)
	public @ResponseBody
	@PreAuthorize("hasRole('ROLE_ADMINS')")
	Contributor replaceContributor(@PathVariable("id") String id,
			@RequestBody Contributor contributor) {
		service.store(contributor);
		return contributor;
	}

	/** 
	 * Deletes a contributor by ID.
	 * @param id the id of the contributor to delete.
	 */
	@RequestMapping(value = "contributors/{id}", method = RequestMethod.DELETE)
	public @ResponseBody
	@PreAuthorize("hasRole('ROLE_ADMINS')")
	void removeContributor(@PathVariable("id") String id) {
		service.delete(id);
	}
}
