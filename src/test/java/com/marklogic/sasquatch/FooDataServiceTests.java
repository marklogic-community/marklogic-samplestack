package com.marklogic.sasquatch;

import java.util.Calendar;
import java.util.Date;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

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
	}

	

}
