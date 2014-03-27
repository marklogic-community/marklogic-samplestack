package com.marklogic.sasquatch.impl;

import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;

import com.marklogic.sasquatch.Application;


public class SasquatchWebApplicationInitializer extends
		AbstractAnnotationConfigDispatcherServletInitializer {

	protected Class<?>[] getRootConfigClasses() {
		return new Class[] { Application.class };
	}

	protected Class<?>[] getServletConfigClasses() {
		return new Class[] { Application.class };
	}

	protected String[] getServletMappings() {
		return new String[] { "/sasquatch/*" };
	}

}
