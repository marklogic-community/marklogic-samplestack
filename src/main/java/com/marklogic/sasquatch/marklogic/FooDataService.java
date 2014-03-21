package com.marklogic.sasquatch.marklogic;

import java.util.List;

import com.marklogic.sasquatch.domain.FooBean;

public interface FooDataService {

	public FooBean getFooBean(Long id);
	
	public void storeFooBean(FooBean bean);

	public void deleteFooBean(Long id);

	public List<String> getFooIds();
}
