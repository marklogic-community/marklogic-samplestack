package com.marklogic.sasquatch.marklogic;

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

import com.marklogic.sasquatch.SasquatchConfiguration;
import com.marklogic.sasquatch.SasquatchWebConfiguration;
import com.marklogic.sasquatch.domain.FooBean;
import com.marklogic.sasquatch.marklogic.FooDataService;

@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = {SasquatchConfiguration.class, SasquatchWebConfiguration.class })
public class FooDataServiceTests {

	@Autowired
	FooDataService fooService;
	
	
	private FooBean newFoo(Long id) {
		FooBean newBean = new FooBean(id, "name"+id);
		newBean.setDoubleValue(Math.random());
		int latitude =(int) Math.floor(Math.random() * 180) - 90;

		int longitude =(int) Math.floor(Math.random() * 360) - 180;
		newBean.setPoint(Integer.toString(latitude) + "," + Integer.toString(longitude) );
		newBean.setStartDate(new Date());
		return newBean;
	}
	
	@Test
	public void testBeanMaking() {
		FooBean f1 = newFoo(1L);
		fooService.storeFooBean(f1);
		
		FooBean f2 = fooService.getFooBean(1L);
		
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
		FooBean f1 = newFoo(1L);
		fooService.storeFooBean(f1);
		FooBean f2 = newFoo(2L);
		fooService.storeFooBean(f2);
		
		List<String> fooList = fooService.getFooIds();
		assertTrue(fooList.contains("/beans/1"));
		assertTrue(fooList.contains("/beans/2"));
		assertEquals(2, fooList.size());


		System.out.print(fooList);
	}

}
