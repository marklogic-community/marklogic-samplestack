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
package com.marklogic.samplestack.dbclient;

import static com.marklogic.samplestack.SamplestackConstants.ISO_8601_FORMAT;

import java.text.SimpleDateFormat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
/**
 * A customization of Jackson's ObjectMapper that configures
 * dates to be serialized as timestamps.
 * TODO Java Client API will probably provide these same
 * defaults, so this can be removed or fetched from Java Client API.
 */
@SuppressWarnings("serial")
public class CustomObjectMapper extends ObjectMapper {

    public CustomObjectMapper() {
        super();
        disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        setDateFormat(new SimpleDateFormat(ISO_8601_FORMAT));
    }
}