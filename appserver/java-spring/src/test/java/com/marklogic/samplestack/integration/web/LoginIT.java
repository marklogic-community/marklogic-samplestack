/*
 * Copyright 2012-2014 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/
package com.marklogic.samplestack.integration.web;

import groovy.lang.Category;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.service.ContributorAddOnService;
import com.marklogic.samplestack.testing.LoginTestsImpl;
import com.marklogic.samplestack.testing.UnitTests;
import com.marklogic.samplestack.testing.Utils;


@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@SpringApplicationConfiguration(classes = { Application.class })
@Category(UnitTests.class)
public class LoginIT extends LoginTestsImpl {

	@Autowired
	private ContributorAddOnService contributorService;
	
	@Before
	public void setupJoe() {
		contributorService.store(Utils.joeUser);
		contributorService.store(Utils.maryAdmin);
	}
	
	@Test
	public void loginBadCredentials() throws Exception {
		super.loginBadCredentials();
	}
	
	@Test
	public void loginNormalFlow() throws Exception {
		super.loginNormalFlow();
	}
	
	@Test
	public void loginForbidden() throws Exception {
		super.loginForbidden();
	}
}
