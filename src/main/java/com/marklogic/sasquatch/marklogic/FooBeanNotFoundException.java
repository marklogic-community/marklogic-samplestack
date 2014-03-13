package com.marklogic.sasquatch.marklogic;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@SuppressWarnings("serial")
@ResponseStatus(HttpStatus.NOT_FOUND)
public class FooBeanNotFoundException extends RuntimeException {

}
