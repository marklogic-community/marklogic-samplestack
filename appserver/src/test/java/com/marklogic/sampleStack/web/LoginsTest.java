package com.marklogic.sampleStack.web;

import static org.junit.Assert.assertEquals;

import java.util.Hashtable;

import javax.naming.Context;
import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.directory.DirContext;
import javax.naming.directory.SearchControls;
import javax.naming.directory.SearchResult;
import javax.naming.ldap.InitialLdapContext;
import javax.naming.ldap.LdapContext;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import com.marklogic.sampleStack.Application;

/**
 * This class is just an experiment to prove out LDAP configuration.
 * It tests the configuration expected on the server to use
 * the same LDAP server as the embedded server.
 * 
 */
@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration(classes = { Application.class })
public class LoginsTest {

	private static final Logger logger = LoggerFactory.getLogger(Application.class);

	final String ldapServer = "ldap://localhost:33389";
	final String ldapSearchBase = "ou=apps,dc=samplestack,dc=org";

	final String ldapUsername = "uid=marklogic-ldap-user,ou=apps,dc=samplestack,dc=org";
	final String ldapPassword = "marklogic-ldap-password";

	final String anonAcct = "samplestack-anonymous";
	final String contribAcct = "samplestack-contributor";
	
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
		env.put("com.sun.jndi.ldap.trace.ber", System.err);

		ctx = new InitialLdapContext(env, null);

	}

	@Test
	public void testFinds() throws NamingException {
		SearchResult srLdapUser = findAccountByAccountName(anonAcct);
		
		assertEquals("samplestack-anonymous", srLdapUser.getAttributes().get("uid").get());

		
		srLdapUser = findAccountByAccountName(contribAcct);
		
		assertEquals("samplestack-contributor", srLdapUser.getAttributes().get("uid").get());

		
		
	}

	private SearchResult findAccountByAccountName(String accountName) throws NamingException {

		String searchFilter = "(&(objectClass=applications)(uid="
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
