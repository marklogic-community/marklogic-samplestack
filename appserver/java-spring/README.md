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

*To build and run:*

Before running anything here, you need MarkLogic 8.x, installed and 
running.  Start this quickstart with it installed and running.  By default this
process will will secure MarkLogic with username admin, password admin.  If you
have already secured MarkLogic, you need to update gradle.properties with the
admin credentials you used during the install and setup process.

You also need A JDK 1.7 or 1.8

The setup assumes you have MarkLogic Server running on your localhost and that
your Admin user credentials are admin:admin. To change this, modify
`appserver/java-spring/gradle.properties`.  All further commands assume you
have changed to the java-spring directory with `cd appserver/java-spring`

* `./gradlew appserver`    Runs assemble, dbLoad, and bootrun.  This single command builds the Java application, configures the MarkLogic instance, loads some sample data, and starts the application.  It stops at some point with this output:

```
Started Application in X seconds...
>Building 85% > :bootRun
```

When it stops like this, the app is ready to to visit.  You can [exercise the
application](http://localhost:8090) and [browse
MarkLogic](http://localhost:8000/qconsole). The two valid users are
`joe@example.com/joesPassword` and `mary@example.com/marysPassword`

Note that the "appserver" task is something just for getting the whole project
running in one step.  See below about the various tasks which comprise
"appserver" and how to run them separately.

This application server hosts the middle tier and a built version of an
angular.js MVC browser application.  This browser application is runable
separately as well; see the [browser readme](../../browser/README.md) for
instructions on how to set up and build with Samplestack's browser application.


*If you're stuck...*

Its possible that you will need to clean your environment, especially if you're following Samplestack development as it happens.  This series of commands should ensure that you are running the freshest code and that MarkLogic is ready to be initialized.

`./gradlew --stop`     (if you've been using the gradle daemon.)
`./gradlew clean`
`./gradlew dbteardown`

*gradle tasks used in Samplestack development*

* `./gradlew dbInit`   This is the task that initializes a MarkLogic server and preps it for runninng Samplestack.  It is a one-time task; after running, the users, roles, database, and REST server will be available for configuration.
* `./gradlew dbTeardown` This command removes Samplestack's entire REST server, database, and security objects from the MarkLogic server.

* `./gradlew clean`  This built-in gradle task cleans the build directory.  When in doubt, try it.
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

* `./gradlew eclipse`  is one way to set up this project for use in eclipse.  [wiki link]
* `./gradlew javadoc` These docs are built in build/docs/javadoc

* `./gradlew test` This command runs unit tests.  
* `./gradlew unitTest` This command runs fast unit tests that mock MarkLogic Server.  
* `./gradlew dbTest` This command runs the unit tests for server extensions.
* `./gradlew integrationTest` This command runs the tests that exercise the whole middle and database tier apparatus.

*To use with Eclipse*

See project wiki https://github.com/marklogic/marklogic-samplestack/wiki/Getting-Started-in-Eclipse



### Endpoints

Here are the endpoints supported by the middle tier appserver:

* GET /v1/session
* POST /v1/session
* DELETE /v1/session
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
* POST /v1/tags  tags support (typeahead, tags dialog, related tags)
* GET /v1/contributors paginated list of contributors
* POST /v1/contributors Create a user  (admin role only)
* GET/PUT/DELETE /v1/contributors/{id} Get, update, remove Users


## License

Copyright © 2015 MarkLogic

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
