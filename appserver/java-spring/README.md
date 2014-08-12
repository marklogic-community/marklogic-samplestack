# samplestack, Java-Spring Appserver

The implementation of samplestack that runs using 

* gradle as build tool
* Java as middle-tier development language
* Spring Boot as application framework
* MarkLogic as database tier

## Quickstart 

*To build and run in one step:*

Start with an out-of-the box MarkLogic server, installed and running.  By default, MarkLogic will be secured with username admin, password admin.  If you have already secured MarkLogic, you need to update gradle.properties with the admin credentials you used to secure it.

* `./gradlew appserver`    Runs assemble, dbLoad, and bootrun

*To build the app*

* `./gradlew assemble`   This command bootstraps the middle tier and builds the Java project
* `./gradlew dbLoad`    This command loads some sample data
* `./gradlew bootrun`       This command runs the middle tier and MarkLogic services
* See the sibling project in /browser for instructions on running the browser application

*To begin developing*

* `./gradlew test` This command runs unit tests

*To use with Eclipse*

See project wiki http://github.com/marklogic/samplestack-marklogic/wiki

### Endpoints

By default the middle-tier appserver will be running on port 8090

* GET /v1/session
* POST /v1/login
* GET /v1/logout
* GET /v1/questions  Get a paginated list of questions (snippet form)
* GET /v1/questions?q=term&start=20
* POST /v1/search
* POST /v1/questions
* GET /v1/questions/{id}
* POST /v1/questions/{id}/comments
* POST /v1/questions/{id}/answers
* POST /v1/questions/{id}/upvotes
* POST /v1/questions/{id}/downvotes
* POST /v1/questions/{id}/answers/{id}/upvotes
* POST /v1/questions/{id}/answers/{id}/downvotes
* POST /v1/questions/{id}/answers/{id}/accept
* GET /v1/tags
* GET /v1/tags?q=
* GET /v1/contributors paginated list of foo object URIs as JSON array
* POST /v1/contributors Create a user
* GET/PUT/DELETE /v1/contributors/{id} Get, update, remove Users

TODO: related tags


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
