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

# marklogic-samplestack-angular

* npm update
* bower update
* gulp <command>

<command> may be `build`, `unit`, `watch`.

In watch mode, you may use these URLs:

[https://localhost:3000](https://localhost:3000) -- view the running app.
Livereload is enabled by a script embedded in the app so changes should
be instantly seen in a browser.

[https://localhost:3001/unit-runner.html](https://localhost:3001/unit-runner.html) -- run
unit tests within the browser.  Unit tests are run upon build and upon changes
during watch mode using PhantomJS and results are reported in the console.
It may also be useful to run the tests from within the browser to debug.
>>>>>>> Squashed 'browser/' changes from df852a4..55bdc19

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

