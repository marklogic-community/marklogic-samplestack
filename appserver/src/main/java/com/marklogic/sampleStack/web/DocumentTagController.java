package com.marklogic.sampleStack.web;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.util.UriComponentsBuilder;

import com.marklogic.client.io.SearchHandle;
import com.marklogic.client.query.MatchDocumentSummary;
import com.marklogic.sampleStack.domain.DocumentTag;
import com.marklogic.sampleStack.service.DocumentTagDataService;

@Controller
public class DocumentTagController {

	@Autowired
	private DocumentTagDataService service;
	
	@RequestMapping(value="tags", method=RequestMethod.GET)
	public @ResponseBody
	List<String> getTagList() {
		SearchHandle results = service.searchTags("");
		List<String> tagList = new ArrayList<String>();
		for (MatchDocumentSummary matchDocumentSummary : results.getMatchResults()) {
			tagList.add(matchDocumentSummary.getUri());
		}
		return tagList;
	}
	
	@RequestMapping(value = "tags", method = RequestMethod.POST)
	public @ResponseBody
	ResponseEntity<?> postTag(@RequestBody DocumentTag tag) {
		// validate
		
		String newUri = service.store(tag);

		URI location = UriComponentsBuilder.newInstance()
				.path(newUri).build().encode()
				.toUri();

		HttpHeaders headers = new HttpHeaders();
		headers.setLocation(location);
		return new ResponseEntity<Void>(headers, HttpStatus.CREATED);
	}
}
