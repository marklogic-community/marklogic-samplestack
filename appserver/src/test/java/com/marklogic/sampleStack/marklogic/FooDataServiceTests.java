package com.marklogic.sampleStack.marklogic;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.util.Date;
import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.sampleStack.Application;
import com.marklogic.sampleStack.domain.Foo;
import com.marklogic.sampleStack.marklogic.FooDataService;

@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = {Application.class })
public class FooDataServiceTests {

	@Autowired
	FooDataService fooService;
	
	
	private Foo newFoo(Long id) {
		Foo newBean = new Foo(id, "name"+id);
		newBean.setDoubleValue(Math.random());
		int latitude =(int) Math.floor(Math.random() * 180) - 90;

		int longitude =(int) Math.floor(Math.random() * 360) - 180;
		newBean.setPoint(Integer.toString(latitude) + "," + Integer.toString(longitude) );
		newBean.setStartDate(new Date());
		return newBean;
	}
	
	@Test
	public void testBeanMaking() {
		Foo f1 = newFoo(1L);
		fooService.storeFoo(f1);
		
		Foo f2 = fooService.getFoo(1L);
		
		assertNotNull(f2);
		
		assertEquals(String.format("%8f",f1.getDoubleValue()), 
				String.format("%8f", f2.getDoubleValue()));
		assertEquals(f1.getStartDate(), f2.getStartDate());
		assertEquals(f1.getId(), f2.getId());
		assertEquals(f1.getName(), f2.getName());
		assertEquals(f1.getPoint(), f2.getPoint());
		fooService.deleteFooBean(1L);
	}

	@Test
	public void testList() {
		Foo f1 = newFoo(1L);
		fooService.storeFoo(f1);
		Foo f2 = newFoo(2L);
		fooService.storeFoo(f2);
		
		List<String> fooList = fooService.getDocumentUris();
		assertTrue(fooList.contains("/foo/1"));
		assertTrue(fooList.contains("/foo/2"));
		assertEquals(2, fooList.size());
		
		System.out.print(fooList);
	}

	@Test
	public void testSearch() {
		Foo f = newFoo(15L);
		f.setName("words words words");
		fooService.storeFoo(f);
		List<Foo> fooList = fooService.search("words");
		Long id = fooList.get(0).getId();
		
		assertEquals(1, fooList.size());
		assertEquals("Get back ID from first search", (Long) 15L, (Long) id);
		
		fooService.deleteFooBean(id);
		fooList = fooService.search("word");
		assertEquals(0, fooList.size());
		
	}
}
