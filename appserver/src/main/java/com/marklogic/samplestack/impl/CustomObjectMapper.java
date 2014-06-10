package com.marklogic.samplestack.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

@SuppressWarnings("serial")
/**
 * A customization of Jackson's ObjectMapper that configures
 * dates to be serialized as timestamps.
 */
public class CustomObjectMapper extends ObjectMapper {

    public CustomObjectMapper() {
        super();
        disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
}