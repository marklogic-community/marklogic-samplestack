# samplestack-java

The implementation of samplestack that runs using 

* gradle as build tool
* Java as middle-tier development language
* Spring Boot as application framework
* MarkLogic as database tier

**To run Java unit tests**:

* `./gradlew test`

**To run the Java application**:

* `./gradlew boot` -- builds and runs the app (on localhost:8080)


### Endpoints currently supported

* GET /questions  Get a paginated list of questions (snippet form)
  GET /questions?q=
* GET /contributors paginated list of foo object URIs as JSON array

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
