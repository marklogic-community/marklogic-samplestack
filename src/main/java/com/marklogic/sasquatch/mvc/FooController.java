package com.marklogic.sasquatch.mvc;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.util.UriComponentsBuilder;

import com.marklogic.sasquatch.domain.FooBean;
import com.marklogic.sasquatch.impl.FooDataServiceImpl;
import com.marklogic.sasquatch.marklogic.FooDataService;

@Controller
public class FooController {

	private final Logger logger = LoggerFactory.getLogger(FooController.class);

	@Autowired
	private FooDataService fooDao;

	@RequestMapping(value = "foo", method = RequestMethod.GET)
	public @ResponseBody
	List<String> getFooList() {
		return fooDao.getFooIds();
	}
	
	@RequestMapping(value = "foo", method = RequestMethod.POST)
	public @ResponseBody
	ResponseEntity<?> postFoo(@RequestBody FooBean bean) {
		// validate
		fooDao.storeFooBean(bean);

		URI location = UriComponentsBuilder.newInstance()
				.path("/fo/" + Long.toString(bean.getId())).build().encode()
				.toUri();

		HttpHeaders headers = new HttpHeaders();
		headers.setLocation(location);
		return new ResponseEntity<Void>(headers, HttpStatus.CREATED);
	}

	@RequestMapping(value = "foo/{id}", method = RequestMethod.GET)
	public @ResponseBody
	
	FooBean getFoo(@PathVariable(value = "id") Long id) {
		// validate
		return fooDao.getFooBean(id);
	}

	@RequestMapping(value = "foo/{id}", method = RequestMethod.PUT)
	public @ResponseBody
	FooBean putFoo(@PathVariable(value = "id") Long id,
			@RequestBody FooBean bean) {
		// validate id attr.
		fooDao.storeFooBean(bean);
		return bean;
	}

	@RequestMapping(value = "foo/new", method = RequestMethod.GET)
	public @ResponseBody
	FooBean newFooBean(
			@RequestParam(value = "name", required = false, defaultValue = "name") String name,
			@RequestParam(value = "id", required = false) Long id) {
		// return new FooBean(counter.incrementAndGet(), String.format(template,
		// name));
		logger.info("New foo bean");
		FooBean bean = new FooBean();
		bean.setName(name);
		if (id == null) {
			bean.setId(UUID.randomUUID().getLeastSignificantBits());
		} else {
			bean.setId(id);
		}
		return bean;
	}

	@RequestMapping(value = "foo/{id}", method = RequestMethod.DELETE)
	public @ResponseBody
	ResponseEntity<?> deleteFooBean(@PathVariable(value = "id") Long id) {
		fooDao.deleteFooBean(id);
		return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
	}
}
