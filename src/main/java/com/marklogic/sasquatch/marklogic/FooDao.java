package com.marklogic.sasquatch.marklogic;

import com.marklogic.sasquatch.domain.FooBean;

public interface FooDao {

	public String getMessage();

	public FooBean getFooBean(Long id);
	
	public void storeFooBean(FooBean bean);

	public void deleteFooBean(Long id);
}
