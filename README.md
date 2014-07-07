# marklogic-samplestack

A complete application that demonstrates using MarkLogic in a three-tier application architecture.

The application implements a "Question and Answer" Scenario.

[ Scenario ]

This repository contains two implementations of the application, 

* One is for the Java Enterprise Developer, and implemented using Java, Spring, and Gradle.
* One is for the JavaScript developer, and implemented using JavaScript, node.js and Gulp.

These two applications share the same view of the three application tiers.

## Usage

# Java/Spring implementation

* install MarklLogic and start it
* ```cd appserver/java-spring```
* TEMPORARY STEP: build and install ML java client from trunk as Maven package.. in a separate directory:
  * `git clone https://github.com/marklogic/java-client-api`
  * `cd java-client-api`
  * `mvn -Dmaven.test.skip=true install`
*Note that the relationship between trunk on the client api and this project is volatile until EA-2*

See README.md in appserver/java-spring for further information on the samplestack-java


# JavaScript/Node implementation

* **install node/npm**
* `npm install -g bower`
* `npm install -g gulp`
* `cd browser`
* `npm install`
* `bower install`

*(in a separate terminal session...)*

* `cd browser`
* `npm install`
* `bower install`

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
