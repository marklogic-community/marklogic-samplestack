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
package com.marklogic.samplestack.mock;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.springframework.stereotype.Component;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.Transaction;
import com.marklogic.client.io.marker.SearchReadHandle;
import com.marklogic.client.pojo.PojoPage;
import com.marklogic.client.pojo.PojoQueryBuilder;
import com.marklogic.client.pojo.PojoQueryDefinition;
import com.marklogic.client.pojo.PojoRepository;
import com.marklogic.client.query.QueryDefinition;
import com.marklogic.samplestack.domain.Contributor;

@Component
public class MockPojoRepositoryImpl implements
		PojoRepository<Contributor, String> {


	public void write(Contributor entity) {
		// ignore
	}

	public void write(Contributor entity, String... collections) {
		// ignore
	}

	public void write(Contributor entity, Transaction transaction) {
		// ignore
	}

	public void write(Contributor entity, Transaction transaction,
			String... collections) {
		// ignore
	}

	public boolean exists(String id) {
		return false; // not tested
	}

	public long count() {
		return 0L;
	}

	public long count(String... collection) {
		return 0L;
	}

	public long count(QueryDefinition query) {
		return 0L;
	}

	public void delete(String... ids) {
		// ignore
	}

	public void deleteAll() {
		// ignore
	}

	public Contributor read(String id) {
		Contributor newContributor = new Contributor();
		newContributor.setId(id);
		return newContributor;

	}

	public Contributor read(String id, Transaction transaction) {
		return this.read(id);
	}

	public PojoPage<Contributor> read(String[] ids) {
		// unused
		return null;
	}

	public PojoPage<Contributor> read(String[] ids, Transaction transaction) {
		return this.read(ids);
	}

	public PojoPage<Contributor> readAll(long start) {
		Contributor c1 = new Contributor();
		Contributor c2 = new Contributor();
		c1.setId("1");
		c1.setDisplayName("contributor1");
		c2.setId("2");
		c2.setDisplayName("contributor2");
		List<Contributor> l = new ArrayList<Contributor>();
		l.add(c1);
		l.add(c2);
		return new MockPojoPage(l);
	}

	public PojoPage<Contributor> readAll(long start, Transaction transaction) {
		return readAll(0L);
	}

	public PojoPage<Contributor> search(long start, String... collections) {
		return readAll(0L);
	}

	public PojoPage<Contributor> search(long start, Transaction transaction,
			String... collections) {
		return readAll(0L);
	}

	public PojoPage<Contributor> search(PojoQueryDefinition query, long start) {
		return readAll(0L);
	}

	public PojoPage<Contributor> search(PojoQueryDefinition query, long start,
			Transaction transaction) {
		return readAll(0L);
	}

	public PojoPage<Contributor> search(PojoQueryDefinition query, long start,
			SearchReadHandle searchHandle) {
		return readAll(0L);
	}

	public PojoPage<Contributor> search(PojoQueryDefinition query, long start,
			SearchReadHandle searchHandle, Transaction transaction) {
		return readAll(0L);
	}

	public PojoQueryBuilder<Contributor> getQueryBuilder() {
		return null;
	}

	public long getPageLength() {
		return 10;
	}

	public void setPageLength(long length) {
		//
	}

	public void defineIdField(String fieldName) {
		//
	}

	public DatabaseClient getDatabaseClient() {
		return null;
	}

	private class MockPojoPage implements PojoPage<Contributor> {

		List<Contributor> contributors = new ArrayList<Contributor>();

		private MockPojoPage(List<Contributor> list) {
			this.contributors = list;
		}

		@Override
		public Iterator<Contributor> iterator() {
			return contributors.iterator();
		}

		@Override
		public long getStart() {
			return 1;
		}

		@Override
		public long getPageSize() {
			return 10;
		}

		@Override
		public long getTotalSize() {
			return contributors.size();
		}

		@Override
		public long size() {
			return contributors.size();
		}

		@Override
		public long getTotalPages() {
			return 1;
		}

		@Override
		public boolean hasContent() {
			return true;
		}

		@Override
		public boolean hasNextPage() {
			return false;
		}

		@Override
		public boolean hasPreviousPage() {
			return false;
		}

		@Override
		public long getPageNumber() {
			return 1;
		}

		@Override
		public boolean isFirstPage() {
			return true;
		}

		@Override
		public boolean isLastPage() {
			return true;
		}

		@Override
		public boolean hasNext() {
			return false;
		}

		@Override
		public Contributor next() {
			return null;
		}

		@Override
		public void close() {
			//noop
		}

	}

	@Override
	public long count(PojoQueryDefinition query) {
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public boolean exists(String id, Transaction transaction) {
		return false;
	}

	@Override
	public long count(Transaction transaction) {
		return 0;
	}

	@Override
	public long count(String[] collections, Transaction transaction) {
		return 0;
	}

	@Override
	public long count(PojoQueryDefinition query, Transaction transaction) {
		return 0;
	}

	@Override
	public void delete(String[] ids, Transaction transaction) {
		// noop
	}

	@Override
	public void deleteAll(Transaction transaction) {
		// noop
	}

	@Override
	public String getDocumentUri(Contributor pojo) {
		return "/some-uri.json";
	}

}
