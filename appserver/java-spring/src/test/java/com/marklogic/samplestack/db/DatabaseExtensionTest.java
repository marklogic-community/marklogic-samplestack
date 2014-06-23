package com.marklogic.samplestack.db;

/**
 * Database extensions do not test the code in the samplestack middle tier, but rather
 * directly exercise transforms and options installed on the server.
 * JUnit is a convenient way to ensure test coverage for these server-side components.
 * These tests do not require the web tier or LDAP security to be set up.
 */
public interface DatabaseExtensionTest {

}
