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
package com.marklogic.samplestack.testing;

/**
 * Marker interface for test categories.
 * Database extensions do not test the code in the samplestack middle tier, but rather
 * directly exercise transforms and options installed on the server.
 * JUnit is a convenient way to ensure test coverage for these server-side components.
 * These tests do not require the web tier or LDAP security to be set up.
 */
public interface DatabaseExtensionTests {

}
