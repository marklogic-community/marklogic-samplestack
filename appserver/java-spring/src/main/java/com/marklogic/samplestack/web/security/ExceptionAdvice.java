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
package com.marklogic.samplestack.web.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.samplestack.exception.SamplestackIOException;
import com.marklogic.samplestack.exception.SamplestackInvalidParameterException;
import com.marklogic.samplestack.exception.SamplestackNotFoundException;
import com.marklogic.samplestack.exception.SamplestackSearchException;
import com.marklogic.samplestack.web.JsonHttpResponse;

/**
 * Configures customizations for mapping application
 * exceptions to HTTP responses.
 * Spring automatically weaves this class into the
 * web application.
 */
@ControllerAdvice
public class ExceptionAdvice {

	@Autowired
	private JsonHttpResponse errors;

	/**
	 * Not found should return 404 and a JSON body.
	 * 
	 * @param ex
	 *            Exception that triggers a 404.
	 * @return A JSON message body and 404 response code.
	 */
	@ResponseStatus(HttpStatus.NOT_FOUND)
	@ExceptionHandler({SamplestackNotFoundException.class, ResourceNotFoundException.class})
	public @ResponseBody JsonNode handleNotFound(Exception ex) {
		return errors.makeJsonResponse(404, ex.getMessage());
	}

	/**
	 * Unsupported method should return 405 and a JSON body.
	 * 
	 * @param ex
	 *            Exception that triggers a 405.
	 * @return A JSON message body and 405 response code.
	 */
	@ResponseStatus(HttpStatus.METHOD_NOT_ALLOWED)
	@ExceptionHandler(HttpRequestMethodNotSupportedException.class)
	public @ResponseBody JsonNode handleMethodNotAllowed(Exception ex) {
		return errors.makeJsonResponse(405, ex.getMessage());
	}

	/**
	 * Unsupported method should return 400 and a JSON body.
	 * 
	 * @param ex
	 *            Exception that triggers a 400.
	 * @return A JSON message body and 400 response code.
	 */
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	@ExceptionHandler({SamplestackIOException.class, SamplestackSearchException.class, SamplestackInvalidParameterException.class})
	public @ResponseBody JsonNode handleIOException(Exception ex) {
		return errors.makeJsonResponse(400, ex.getMessage());
	}
}
