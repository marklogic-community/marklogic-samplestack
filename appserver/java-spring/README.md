# samplestack, Java-Spring Appserver

## What is it?

The implementation of samplestack that runs using 

* gradle as build tool
* Java as middle-tier development language
* Spring Boot as application framework
* MarkLogic as database tier

This README covers running samplestack quickly, then documents each of the commands
available to the Java developer as she iterates through code exploration.

## Quickstart 

*To build and run in one step:*

Before running anything here, you will need an EA-3 release of MarkLogic.
Start this quickstart with it installed and running.  By default this process will
will secure MarkLogic with username admin, password admin.  If you have already secured 
MarkLogic, you need to update gradle.properties with the admin credentials you used 
during the install and setup process.

* `./gradlew appserver`    Runs assemble, dbLoad, and bootrun.  This single command builds the Java application, configures the MarkLogic instance, loads some sample data, and starts the application.  When it stops logging messages, the application is ready to visit at http://localhost:8090   From here you can [ exercise the application ] and [ browse MarkLogic ]  (TODO update with links to app docs and qconsole)

*If you're stuck...*

Its possible that you will need to clean your environment, especially if you're following Samplestack development as it happens.  This series of commands should ensure that you are running the freshest code and that MarkLogic is ready to be initialized.

`./gradlew --stop`     (if you've been using the gradle daemon.)
`./gradlew clean`
`./gradlew dbteardown`

*gradle tasks used in Samplestack development*

* `./gradlew assemble`   This command bootstraps the middle tier, runs tests, and builds the Java project.  When it is done you have verified the unit tests and built samplestack.
* `./gradlew tasks`  Lists tasks available to the samplestack project.
 
* `./gradlew dbConfigure`  Incrementally applies configuration changes in ../../database/* to the MarkLogic instance.
* `./gradlew dbConfigureClean`   Removes cache info for configuration from build direcotiry (so next dbConfigure will process all files).
* `./gradlew dbConfigureAll`   dbConfigureClean then runs dbConfigure.  Uploads all config files to MarkLogic.
 
* `./gradlew bootRun`       This command runs the middle tier and MarkLogic services.  This project also contains a built version of the front-end angular application.  If you want to use and exercise the front-end independently, see the sibling project in /browser for instructions on running the browser application
* `./gradlew seedDataFetch`  Fetches seed data from a remote location to the build directory.
* `./gradlew seedDataExtract`  Extracts the fetched seed data tgz to within the directory.
* `./gradlew dbLoad` Runs seedDataFetch, seedDataExtract as dependencies (unless up-to-date) to load seed data.
* `./gradlew dbClear`  Deletes all data from the database.
 
* ./gradlew eclipse  is one way to set up this project for use in eclipse.  [wiki link]
* `./gradlew javadoc` These docs are built in build/docs/javadoc

* `./gradlew test` This command runs unit tests.  
* `./gradlew unitTest` This command runs fast unit tests that mock MarkLogic Server.  
* `./gradlew dbTest` This command runs the unit tests for server extensions.
* `./gradlew integrationTest` This command runs the tests that exercise the whole middle and database tier apparatus.

*To use with Eclipse*

See project wiki https://github.com/marklogic/marklogic-samplestack/wiki/Getting-Started-in-Eclipse

### Endpoints

Having run either the bootRun or appserver tasks, the shell blocks.
The middle-tier appserver will be running on port 8090

You can use the browser application at
http://localhost:8090.  The two valid users are
joeUser@marklogic.com/joesPassword and
maryAdmin@marklogic.com/marysPassword

Here are the endpoints supported by the middle tier appserver:

* GET /v1/session
* POST /v1/session
* DELETE /v1/session
* GET /v1/questions  Get a paginated list of questions (snippet form)
* GET /v1/questions?q=term&start=20
* GET /v1/hasVoted?postId=id&contributorId=id
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
* POST /v1/tags   with MarkLogic structured query (Not tested for EA-3)
* POST /v1/tags/{name}   related tags             (Not tested for EA-3)
* GET /v1/contributors paginated list of contributors
* POST /v1/contributors Create a user  (admin role only)
* GET/PUT/DELETE /v1/contributors/{id} Get, update, remove Users


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
