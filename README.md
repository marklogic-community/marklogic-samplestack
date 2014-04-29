# samplestack

An application to demonstrate using MarkLogic in a Java Application Server environment.

## Usage


```bash
git clone https://github.com/marklogic/samplestack-java.git
```

**One-time setup**:

* install MarklLogic
* build and install ML java client from trunk as Maven package.. in a separate directory:
** git clone https://github.com/marklogic/java-client-api
** cd java-client-api
** mvn -Dmaven.test.skip=true install
* **install node/npm**
* `npm install -g bower`
* `npm install -g gulp`
* `cd browser`
* `npm install`
* `bower install`

**Development Steps**:

*(Do these the first time you run.  You may need to repeat them if you pull
code changes in the future)*

* clear MarkLogic data directory and start MarkLogic Server
with fresh data dir
* `./gradlew assemble`
* `./gradlew fooconfig`

*(in a separate terminal session...)*

* `cd browser`
* `npm install`
* `bower install`

**To run Java unit tests**:

* `./gradlew test`

**To run the Java application**:

* `./gradlew boot` -- builds and runs the app (on localhost:8080) and enters
watch mode (subsequent changes are instantaneously applied to the running
server)

**To run the Angular unit tests and launch the web application**
(in a separate terminal):

* `cd browser`
* `gulp unit`
* `gulp run`

### Endpoints currently supported

* GET /foo/new    generate a new foo object
* GET /foo        list of foo object URIs as JSON array
* GET /foo/{id}   get a particular foo
* PUT /foo/{id}   replace a foo
* DELETE /foo/{id} delete a foo

GET /foo/search?q=search    simple search over foos

### Accessing the web application

[http://localhost:3000](http://localhost:3000)

### To run web application unit tests in a browser:

[http://localhost:3001](http://localhost:3001/unit-runner.html)

## License

Copyright © 2014 MarkLogic

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

