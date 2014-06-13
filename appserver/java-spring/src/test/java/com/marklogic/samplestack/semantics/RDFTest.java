package com.marklogic.samplestack.semantics;

import java.io.IOException;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.util.FileCopyUtils;

import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.service.MarkLogicOperations;

/*
 * Basic test for RDF ingestion and query
 */
@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = Application.class)
public class RDFTest {

	@Autowired
	private MarkLogicOperations graphStore;

	@Before
	public void loadTurtle() throws IOException {
		Resource resource = new ClassPathResource("triples/skos1.ttl");
		// graphStore.insertGraph("http://marklogic.com/example/skos1", "text/turtle", resource.getInputStream());
	}
	
	@Test
	public void sparqlOne() throws IOException {
		ClassPathResource resource = new ClassPathResource("sparql/skos1.sparql");
		String sparqlQuery = new String(FileCopyUtils.copyToByteArray(resource.getInputStream()));
		// String jsonSparqlResult = graphStore.sparql(sparqlQuery);
	}
}
