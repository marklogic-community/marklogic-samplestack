# marklogic-samplestack


<!--


NO TRAVIS badge until things start to settle down in e2e tests

***********************************************************************
REMEMBER to change the branch name in this code when preparing releases
***********************************************************************
<div>
<a target="_blank" href="https://travis-ci.org/marklogic/marklogic-samplestack">
  <img hspace="15" align="right" src="https://travis-ci.org/marklogic/marklogic-samplestack.svg"></img>
</a>
</div>
<div/>

-->

> Samplestack is a comprehensive sample application that demonstrates how to build an effective MarkLogic application.  Based on the idea of a "Question and Answer" website, Samplestack shows you how to integrate MarkLogic into a three-tier application architecture (browser, application server, and database).

## README for Version 1.1.0

This application features two middle tiers

- one for the Java enterprise developer, implemented using Java, Spring and Gradle
- one for the JavaScript developer, implemented using JavaScript, Node.js and Gulp.

The project includes the following major components:
* [MarkLogic](http://www.marklogic.com/) for the database tier
* MVC browser application implemented in [Angular.js](https://angularjs.org)
* Middle-tier REST server implemented in Java/[Spring](http://projects.spring.io/spring-framework/)
* [Gradle](http://www.gradle.org/) framework to drive build and configuration of the appserver and database tiers in Java/Groovy
* Middle-tier REST server implemented in Node.js/[Express](expressjs.com)
* [Gulp](http://www.gradle.org/)-based automation to drive build and configuration of Javascript and database tiers (**note: database-tier Gulp-based setup coming soon**)
* Unit and end-to-end tests

This README covers the following topics:
* [Getting Started](#getting-started)
* [Additional Information](#additional-information)
* [Contributing](#contributing)
* [License](#license)

## Getting Started

To start, clone this repository. For example, run the following command:  

```
git clone https://github.com/marklogic/marklogic-samplestack
```

Then, launch each of the tiers to get a feel for Samplestack's 3-tiered architecture (from the bottom-up):

1) **Database**

This version of Samplestack has been tested to run on MarkLogic 8.0-3. Log an issue for questions on compatibility with MarkLogic server versions. Note: There is no direct upgrade path from previous releases. If you had previously been running previous or pre-release version, please perform a full uninstall, including manually deleting data directories, before installing a supported 8.x version for use with Samplestack.

2) **Middle Tier - Application Server**

You can choose to run/examine one of two middle tier application servers.  Each of these will use the same MarkLogic backend configuration and the same MVC browser application.

* [Set up the Java middle tier and database tier with gradle](appserver/java-spring/README.md). A pre-built instance of the browser app is included.
* [Set up the JavaScript Node.js-based tiers and database tier using npm](./README-JavaScript.md)

## Additional Information
For more information, see the following:
* READMEs for the [database](database/README.md), [Java appserver](appserver/java-spring/README.md), and [JavaScript-based tiers](README-JavaScript.md).
* [Samplestack wiki](https://github.com/marklogic/marklogic-samplestack/wiki).
* [MarkLogic product documentation](http://docs.marklogic.com) for further details on MarkLogic Server and the Client APIs.
* MarkLogic [Developer Community](http://developer.marklogic.com/) site with tutorials, blogs, and more.
* Full [Documentation](http://docs.marklogic.com/guide/ref-arch) on the Reference Architecture and Samplestack.
* Take [Free MarkLogic Training](http://www.marklogic.com/services/training).
Some of the courses cover how to build Samplestack.

## Reference Architecture Introduction

Samplestack is an instantiation of MarkLogic’s Reference Architecture. It demonstrates how to structure three-tiered MarkLogic applications for production:

* MarkLogic plays the role of database in Samplestack’s three-tier architecture. Samplestack shows how to configure MarkLogic to ingest, store, and manipulate documents. With the project comes tooling and configuration files to get MarkLogic primed to expose robust search and data services.

* The middle tier brokers the data between the database and the browser-based web application, coordinates integration with additional services (LDAP), locally optimizes applicationdatabase communications, and enforces business rules. There will be two versions of Samplestack which you can explore based on your preference. One version features a Java middle tier with a Spring Framework and Gradle automation. There will also be a JavaScriptNode.js implementation with gulp automation.

* The web-based front-end is a Model-View-Controller browser application which drives workflow using the business services exposed by the middle-tier and presents the user interface. It is implemented as an Angular.js application.

## Application Overview

The sample application itself is centered around the idea of a Question and Answer site. It is a searchable, transactional, content-rich web application. Users of the application participate in the crowd-sourced knowledge community by asking questions, submitting answers, commenting, and voting. Search is a rich experience with interactive facets and parameters which enable users to narrow in on the answers they seek. The initial seed dataset is an extract of content from the popular [Stack Overflow](http://stackoverflow.com) website.  Their archives are made available under [CC BY-SA](http://creativecommons.org/licenses/by-sa/3.0/) and comprise the seed data for Samplestack.

Each of the features in Samplestack demonstrates an important concept for developers building on MarkLogic:

Samplestack Feature | MarkLogic Concept
------------ | -------------
Full-text Search | Indexes, query styles
User records and Question documents | Data Model for POJOs and JSON.
Users and Roles (log in, log out) | Security (authentication and authorization)
Restricted Content | Role-based Permissions
Facets | Search constraints, analytics
Ask, Answer, Comment | Document updates
Voting | Updates impact sorting
Accepted Answers and Reputation | Transactional model, data integrity
Related Tags | Semantics, using RDF triples and SPARQL

## Contributing

Please see our [contributing guidelines](./CONTRIBUTING.md).

## Support

Samplestack is maintained by MarkLogic Engineering and distributed under the
[Apache 2.0 license](http://www.apache.org/licenses/LICENSE-2.0). It is not
designed for use in production. Everyone is encouraged to file bug reports,
feature requests, and pull requests through GitHub. This input is critical and
will be carefully considered, but we can’t promise a specific resolution or
timeframe for any request. In addition, MarkLogic provides technical support
for release tags of Samplestack to licensed customers under the terms outlined
in the [Support
Handbook](http://www.marklogic.com/files/Mark_Logic_Support_Handbook.pdf) For
more information or to sign up for support, visit
[help.marklogic.com](http://help.marklogic.com).

## License

Copyright © 2012-2015 MarkLogic

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
