/*
 * Copyright 2012-2015 MarkLogic Corporation
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

import static org.junit.Assert.assertEquals;

import java.util.Hashtable;

import javax.naming.Context;
import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.directory.SearchControls;
import javax.naming.directory.SearchResult;
import javax.naming.ldap.InitialLdapContext;
import javax.naming.ldap.LdapContext;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.samplestack.Application;
import com.marklogic.samplestack.testing.IntegrationTests;
import com.marklogic.samplestack.testing.TestDataManager;

/**
 * This class is just an experiment to prove out LDAP configuration.
 * It tests the configuration expected on the server to use
 * the same LDAP server as the embedded server.
 * 
 */
@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@SpringApplicationConfiguration(classes = { Application.class, TestDataManager.class })
@Category(IntegrationTests.class)
public class LDAPIT {

	@SuppressWarnings("unused")
	private static final Logger logger = LoggerFactory.getLogger(LDAPIT.class);

	final String ldapServer = "ldap://localhost:33389";
	final String ldapSearchBase = "dc=samplestack,dc=org";

	//use one of the existing users...
	final String ldapUsername = "uid=testA1@example.com,ou=people,dc=samplestack,dc=org";
	final String ldapPassword = "a1";

	final String contributorName = "Test User";
	
	Hashtable<String, Object> env;
	LdapContext ctx;

	@Before
	public void setup() throws NamingException {
		env = new Hashtable<String, Object>();
		env.put(Context.SECURITY_AUTHENTICATION, "simple");
		if (ldapUsername != null) {
			env.put(Context.SECURITY_PRINCIPAL, ldapUsername);
		}
		if (ldapPassword != null) {
			env.put(Context.SECURITY_CREDENTIALS, ldapPassword);
		}
		env.put(Context.INITIAL_CONTEXT_FACTORY,
				"com.sun.jndi.ldap.LdapCtxFactory");
		env.put(Context.PROVIDER_URL, ldapServer);

		// ensures that objectSID attribute values
		// will be returned as a byte[] instead of a String
		// env.put("java.naming.ldap.attributes.binary", "uid");

		// the following is helpful in debugging errors
		//env.put("com.sun.jndi.ldap.trace.ber", System.err);
		

		ctx = new InitialLdapContext(env, null);

	}


	@Test
	public void testFinds() throws NamingException {
		SearchResult srLdapUser = findAccountByAccountName(contributorName);

		assertEquals("testC1@example.com", srLdapUser.getAttributes().get("uid").get());

	}

	private SearchResult findAccountByAccountName(String accountName) throws NamingException {

		String searchFilter = "(&(objectclass=person)(cn="
				+ accountName + "))";

		SearchControls searchControls = new SearchControls();
		searchControls.setSearchScope(SearchControls.SUBTREE_SCOPE);

		NamingEnumeration<SearchResult> results = ctx.search(ldapSearchBase,
				searchFilter, searchControls);

		SearchResult searchResult = null;
		if (results.hasMoreElements()) {
			searchResult = (SearchResult) results.nextElement();

			// make sure there is not another item available, there should be
			// only 1 match
			if (results.hasMoreElements()) {
				System.err
						.println("Matched multiple users for the accountName: "
								+ accountName);
				return null;
			}
		}

		return searchResult;
	}
	
}
