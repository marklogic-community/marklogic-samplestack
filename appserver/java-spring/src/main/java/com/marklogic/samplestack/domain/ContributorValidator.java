package com.marklogic.samplestack.domain;

import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

public class ContributorValidator implements Validator {

	@Override
	public boolean supports(Class<?> clazz) {
		return Contributor.class.equals(clazz);
	}

	@Override
	public void validate(Object target, Errors errors) {
		// TODO Auto-generated method stub

	}

}
