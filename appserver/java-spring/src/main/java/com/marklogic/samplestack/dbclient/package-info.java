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
/**
 * This package contains the code that interacts with MarkLogic
 * server using the Java Client API.
 * <p>
 * Classes in this package implement the various 
 * {@linkplain com.marklogic.samplestack.service Samplestack services}.
 * <p>
 * You'll find two basic approaches to data access.  
 * {@link com.marklogic.samplestack.domain.Contributor} objects use MarkLogic 8's 
 * {@link com.marklogic.client.pojo.PojoRepository}
 * as a base for data access, while {@link com.marklogic.samplestack.domain.QnADocument} 
 * objects are handled as JSON, and use some techniques for partial document 
 * update, and multi-statement transactions.
 */
package com.marklogic.samplestack.dbclient;