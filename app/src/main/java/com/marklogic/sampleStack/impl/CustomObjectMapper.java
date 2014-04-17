package com.marklogic.sampleStack.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

@SuppressWarnings("serial")
public class CustomObjectMapper extends ObjectMapper {

    public CustomObjectMapper() {
        super();
        disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
}