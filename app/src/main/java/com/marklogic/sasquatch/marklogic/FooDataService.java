package com.marklogic.sasquatch.marklogic;

import java.util.List;

import com.marklogic.sasquatch.domain.Foo;

public interface FooDataService {

	public Foo getFoo(Long id);
	
	public void storeFoo(Foo foo);

	public void deleteFooBean(Long id);

	public List<String> getDocumentUris();

	public List<Foo> search(String queryString);
}
