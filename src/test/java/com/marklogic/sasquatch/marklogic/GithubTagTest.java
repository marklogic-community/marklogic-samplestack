package com.marklogic.sasquatch.marklogic;

import static org.junit.Assert.assertEquals;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.sasquatch.SasquatchConfiguration;
import com.marklogic.sasquatch.SasquatchWebConfiguration;
import com.marklogic.sasquatch.domain.GithubTag;
import com.marklogic.sasquatch.domain.Triple;
import com.marklogic.sasquatch.marklogic.GithubTagDataService;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = {SasquatchConfiguration.class, SasquatchWebConfiguration.class })
public class GithubTagTest {

	GithubTag tag;
	
	@Autowired
	private GithubTagDataService service;
	
	@Test
	public void testMakingATag() throws URISyntaxException {
		tag = new GithubTag();
		
		
		
		String tagNameString = " tagged with computing";
		String tagDocString = "/github/10557684754268789535.json";
		tag.setTagName(tagNameString);
		
		Triple tripleBean = new Triple();
		tripleBean.setSubject(new URI("http://marklogic.com/sasquatch/githubTag1"));
		tripleBean.setPredicate(new URI("http://marklogic.com/sasquatch/tagsDoc"));
		tripleBean.setType(null);
		tripleBean.setObject(tagDocString);
		
		Triple tripleBean2 = new Triple();
		tripleBean2.setSubject(new URI("http://marklogic.com/sasquatch/githubTag1"));
		tripleBean2.setPredicate(new URI("http://marklogic.com/sasquatch/taggedWith"));
		tripleBean2.setType(null);
		tripleBean2.setObject("http://dbpedia.org/resource/Category:Computing");
		
		
		List<Triple> list = new ArrayList<Triple>();
		list.add(tripleBean);
		list.add(tripleBean2);
		tag.setTriples(list);
		
		String tagIdString = service.store(tag);
		
		GithubTag retrievedTag = service.get(tagIdString);
		assertEquals(tagNameString, retrievedTag.getTagName());
		assertEquals(tagDocString, retrievedTag.getTriples().get(0).getObject());
	}
}

