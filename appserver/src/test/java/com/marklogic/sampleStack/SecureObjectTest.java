package com.marklogic.sampleStack;

import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.sampleStack.domain.SecureObject;
import com.marklogic.sampleStack.marklogic.SecureObjectDao;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = Application.class)
/**
 * TODO
 * These are non-functional test stubs for examining secured objects.
 * Post Milestone 1
 * @author cgreer
 *
 */
public class SecureObjectTest {

	@Autowired
	private SecureObjectDao secureDao;

	@Test
	public void testUnauthenticatedAccess() {
		SecureObject secureObject = new SecureObject();

		secureObject.setData("I'm unt authorized");
		secureObject.setAnnotatesDocument("/nope/doesn't/exist.json");
		secureDao.storeSecureObject("/nope/1.json", secureObject);

	}

	@Ignore
	public void testAuthenticatedAccess() {

	}

	@Ignore
	public void testAuthorizedAccess() {

	}

	@Ignore
	public void testDocumentReference() {

	}
}
