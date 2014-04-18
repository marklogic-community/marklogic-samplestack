# sampleStack

An application to demonstrate using MarkLogic in a Java Application Server environment.

## Usage


```bash
git clone https://github.com/marklogic/samplestack-java.git
```

One-time setup:

* install and start MarkLogic with fresh data dir
* build and install ML java client from trunk as Maven package TODO - put on maven central
* `./gradlew assemble`
* **install node**

To run unit tests:

* `./gradlew test`

To run the application:

* `./gradlew boot` -- builds and runs the app (on localhost:8080) and enters
watch mode (subsequent changes are instantaneously applied to the running
server)

### Endpoints currently supported

# GET /foo/new    generate a new foo object
# GET /foo        list of foo object URIs as JSON array
# GET /foo/{id}   get a particular foo
# PUT /foo/{id}   replace a foo
# DELETE /foo/{id} delete a foo

GET /foo/search?q=search    simple search over foos



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

