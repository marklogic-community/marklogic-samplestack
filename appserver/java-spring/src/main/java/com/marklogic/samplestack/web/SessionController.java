package com.marklogic.samplestack.web;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class SessionController {

	@RequestMapping(value = "session", method = RequestMethod.GET)
	public @ResponseBody String hello() {
		return "Hello";
	}
}
