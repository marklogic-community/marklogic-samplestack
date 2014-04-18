package com.marklogic.sampleStack.mvc;

import java.net.URI;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.marklogic.sampleStack.domain.Foo;
import com.marklogic.sampleStack.marklogic.FooDataService;

@RestController
public class FooController {

	private final Logger logger = LoggerFactory.getLogger(FooController.class);

	@Autowired
	private FooDataService fooDao;
	

	@RequestMapping(value = "foo", method = RequestMethod.GET)
	public @ResponseBody
	List<String> getFooList() {
		return fooDao.getDocumentUris();
	}
	
	@RequestMapping(value = "foo", method = RequestMethod.POST)
	public @ResponseBody
	ResponseEntity<?> postFoo(@RequestBody Foo bean) {
		// validate
		fooDao.storeFoo(bean);

		
		URI location = UriComponentsBuilder.newInstance()
				.path("/foo/" + Long.toString(bean.getId())).build().encode()
				.toUri();

		HttpHeaders headers = new HttpHeaders();
		headers.setLocation(location);
		return new ResponseEntity<Void>(headers, HttpStatus.CREATED);
	}

	@RequestMapping(value = "foo/{id}", method = RequestMethod.GET)
	public @ResponseBody
	
	Foo getFoo(@PathVariable(value = "id") Long id) {
		// validate
		return fooDao.getFoo(id);
	}

	@RequestMapping(value = "foo/{id}", method = RequestMethod.PUT)
	public @ResponseBody
	Foo putFoo(@PathVariable(value = "id") Long id,
			@RequestBody Foo bean) {
		// validate id attr.
		fooDao.storeFoo(bean);
		return bean;
	}

	@RequestMapping(value = "foo/new", method = RequestMethod.GET)
	public @ResponseBody
	Foo newFooBean(
			@RequestParam(value = "name", required = false, defaultValue = "name") String name,
			@RequestParam(value = "id", required = false) Long id) {
		// return new Foo(counter.incrementAndGet(), String.format(template,
		// name));
		logger.info("New foo bean");
		Foo bean = new Foo();
		bean.setName(name);
		if (id == null) {
			bean.setId(UUID.randomUUID().getLeastSignificantBits());
		} else {
			bean.setId(id);
		}
		bean.setDoubleValue(1.0002);
		bean.setPoint("-92,23");
		bean.setStartDate(new Date());
		return bean;
	}

	@RequestMapping(value = "foo/{id}", method = RequestMethod.DELETE)
	public @ResponseBody
	ResponseEntity<?> deleteFooBean(@PathVariable(value = "id") Long id) {
		fooDao.deleteFooBean(id);
		return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
	}
	
	@RequestMapping(value = "foo/search", method = RequestMethod.GET)
	public @ResponseBody
	List<Foo> searchFoos(@RequestParam(value = "q") String queryString) {
		return fooDao.search(queryString);
	}
}
