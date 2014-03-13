package com.marklogic.sasquatch.mvc;

import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;

import com.marklogic.sasquatch.SasquatchConfiguration;
import com.marklogic.sasquatch.SasquatchWebConfiguration;

public class SasquatchWebApplicationInitializer extends
		AbstractAnnotationConfigDispatcherServletInitializer {

	protected Class<?>[] getRootConfigClasses() {
		return new Class[] { SasquatchConfiguration.class };
	}

	protected Class<?>[] getServletConfigClasses() {
		return new Class[] { SasquatchWebConfiguration.class };
	}

	protected String[] getServletMappings() {
		return new String[] { "/*" };
	}

}
