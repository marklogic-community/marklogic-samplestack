package com.marklogic.sasquatch.marklogic;

import java.util.List;

import com.marklogic.sasquatch.domain.Foo;

public interface FooDataService {

	public Foo getFoo(Long id);
	
	public void storeFoo(Foo bean);

	public void deleteFooBean(Long id);

	public List<String> getDocumentUris();
}
