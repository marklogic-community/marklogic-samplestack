package com.marklogic.sampleStack.web;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TopController {

	@RequestMapping(value = "/", method = RequestMethod.GET)
	public @ResponseBody String hello() {
		return "Hello";
	}
}
