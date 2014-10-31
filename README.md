# marklogic-samplestack

README for Version 1.0.0-EA3 (In Progress)

Samplestack is a demo "Question and Answer" web application that shows you how to integrate MarkLogic into a three-tier application architecture (browser, application server, and database).

This release features a middle tier for the Java Enterprise Developer, implemented using Java, Spring, and Gradle.

The project includes the following major components:
* Web/browser front end based on Angular.js
* Middle appserver tier implemented in Java/Spring
* Database tier hosted on MarkLogic
* Gradle framework to drive build and configuration of the appserver and database tiers
* Unit tests

This README covers the following topics:
* [Prerequisites](#prerequisites)
* [Getting Started](#getting-started)
* [Additional Information](#additional-information)
* [License](#license)

## Prerequisites
To configure and use this application, you need the following software:
* Java JDK 1.7 or 1.8
* MarkLogic 8.0 Nightly from 10/24/2014 (see instructions [below](#getting-started))
* Node.js, version 0.10 or later. See [nodejs.org](http://nodejs.org).
* A global installation of the Node.js components [bower](http://bower.io) and [gulp](https://github.com/gulpjs/gulp). For details, see [Global Utilities](browser/README.md#global-utilities) in the [browser README](browser/README.md).

The setup instructions assume you have the `git`, `javac`, `node`, `bower`, and `gulp` commands on your path.

The setup procedure may install additional software, such as Gradle and Angular.

## Getting Started

*note for development branch work:*

This README is for a development branch that does not work with any released version of MarkLogic

Use MarkLogic nightly dated 10/24.  

RPM link: https://root.marklogic.com/nightly/builds/linux64/rh6-intel64-80-test-1.marklogic.com/HEAD/pkgs.20141024/MarkLogic-8.0-20141024.x86_64.rpm

Trunk does NOT work for this PR.
Java Client API needs snapshot on or after 10/10/2014.  This should be installed
automatically but may require gradle or maven cache cleaning.

This build requires seed data available internally.  The current seed data version is 1.3:

https://wiki.marklogic.com/pages/viewpageattachments.action?pageId=31359376&highlight=seed-data1.3.tgz

*end note*


Follow this procedure to set up Samplestack in your environment.

1. Install MarkLogic 8 Early Access. See http://ea.marklogic.com/download.

2. Start MarkLogic. For details, see the [MarkLogic Installation Guide](http://docs.marklogic.com/guide/installation/procedures#id_92457).

3. Clone this repository. For example, run the following command:  

    ```
    git clone https://github.com/marklogic/marklogic-samplestack
    ```
4. [Set up the middle and database tiers](#setting-up-the-middle-and-database-tiers).

5. [Set up the browser tier](#setting-up-the-browser-tier).


### Setting Up the Middle and Database Tiers
The setup assume you have MarkLogic Server running on your localhost and that your Admin user credentials are admin:admin. To change this, modify `appserver/java-spring/gradle.properties`.

To install required software, configure, and build the Java middle tier and database tier of Samplestack, run the following commands from the root of your cloned repository:

```
cd appserver/java-spring
./gradlew appserver
```

If the command fails such that you need to run it again, run the following command first to reset the database state:

```
./gradlew dbteardown
```

This command will not return. When you see output of the following form, the middle tier is running, and you can proceed with the browser tier setup:
```
Started Application in X seconds...
>Building 85% > :bootRun
```

Successfully completing this step does the following:
* Bootstraps the middle tier.
* Builds the Java middle tier components.
* Loads the database with sample data.
* Starts up the middle tier and MarkLogic application services.

The middle tier App Server runs on port 8090 by default. Visit http://localhost:8001 if you need to administer the database.

*For details, see the [README in the appserver/java-spring directory](appserver/java-spring/README.md)*

### Setting Up the Browser Tier
Use the following procedure to install required software and bootstrap the Samplestack browser tier. You should already have the middle and database tiers running.

For detailed instructions and troubleshooting, see the [README in the browser directory](browser/README.md).

**NOTE:** If you are on Windows, you must use a Windows command shell, not Cygwin.

**Important**: In order to run the application you must be running *both* the middle-tier **and** the browser webapp.  To do this, **use a separate terminal window for the steps below**.

1. Go to the browser subdirectory of the project:

    ```
    cd browser
    ```
2. Install the browser application.

    ```
    npm install
    bower install
    ```
3. Run the following command to build the web application, run its unit tests, and bring up the required execution environment:

    ```
    gulp run
    ```

When the setup successfully completes, you should see information about the available web servers running the application. The `gulp run` command does not return.

### Running the Application
Once you have the database, appserver, and browser tiers of the application configured and running, navigate to the following URL in your browser to explore the application:

`http://localhost:3000/`

### Restarting the Two Tiers

* To stop the middle tier App Server, press `Control+C`
* To restart,
```
cd marklogic-samplestack/appserver/java-spring
./gradlew bootrun
```

* To stop the browser tier, press `Control+C`
* To restart,
```
cd marklogic-samplestack/browser
gulp run
```

### Next Steps
* Explore the application running at http://localhost:3000.
  * Use the login credentials `joeUser@marklogic.com`, password `joesPassword` to view and search content restricted to the Contributor role.
* Explore the README in the database, appserver and browser directories for details on each tier.
* View the database configuration by visiting http://localhost:8001.
* Explore the database contents using Query Console. Go to http://localhost:8000/qconsole, select the `samplestack` database, and click Explore.

## Additional Information
For more information, see the following:
* README for the [database](database/README.md), [appserver](appserver/java-spring/README.md), and [browser](browser/README.md) tier.
* [Samplestack wiki](https://github.com/marklogic/marklogic-samplestack/wiki).
* [MarkLogic product documentation](http://docs.marklogic.com).

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
