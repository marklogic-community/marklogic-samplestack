# marklogic-samplestack

README for Version 1.0.0-ea3

Samplestack is a comprehensive sample application that demonstrates how to build an effective MarkLogic application.  Based on the idea of a "Question and Answer" website, Samplestack shows you how to integrate MarkLogic into a three-tier application architecture (browser, application server, and database).

This release features a middle tier for the Java Enterprise Developer, implemented using Java, Spring, and Gradle.

The project includes the following major components:
* MVC browser application implemented in [Angular.js](https://angularjs.org)
* Middle appserver tier implemented in Java/[Spring](http://projects.spring.io/spring-framework/)
* [MarkLogic](http://www.marklogic.com/) for the database tier
* [Gradle](http://www.gradle.org/) framework to drive build and configuration of the appserver and database tiers
* Unit and end-to-end tests

A [Node.js](http://nodejs.org/) version of Samplestack that uses gulp automation will be coming soon.

This README covers the following topics:
* [Getting Started](#getting-started)
* [Additional Information](#additional-information)
* [Contributing](#contributing)
* [License](#license)

## Getting Started
To configure and use this application, you need the following software:
* MarLogic 8.0 Early Acceess Release 3 (EA3) (see instructions [below](#getting-started))
* git

Follow this procedure to set up Samplestack in your environment.

1. Install MarkLogic 8 Early Access 3 (EA3). See http://ea.marklogic.com/download.

2. Start MarkLogic. For details, see the [MarkLogic Installation Guide](http://docs.marklogic.com/guide/installation/procedures#id_92457).

3. Clone this repository. For example, run the following command:  

    ```
    git clone https://github.com/marklogic/marklogic-samplestack
    ```

4. You can choose to run/examine one of two middle tier application servers.  Each of these will use the same MarkLogic backend configuration and the same MVC browser application.
    1. [Set up the Java middle tier and database tiers with gradle](appserver/java-spring/README.md)  (Available in EA-3)
    2. [Set up the Node middle and database tiers with gulp](appserver/node-express/README.md) (Available in future release, under development)


## Additional Information
For more information, see the following:
* README for the [database](database/README.md), [appserver](appserver/java-spring/README.md), and [browser](browser/README.md) tier.
* [Samplestack wiki](https://github.com/marklogic/marklogic-samplestack/wiki).
* [MarkLogic product documentation](http://docs.marklogic.com).

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
User records and documents | Data Model for JSON and POJOs
Users and Roles (log in, log out) | Security (authentication and authorization)
Restricted Content | Role-based Permissions
Facets | Search constraints, analytics
Ask, Answer, Comment | Document updates
Voting | Updates impact search relevance
Accepted Answers Reputation | Transactional model, data integrity

Coming soon: Related tags — demonstration of semantics with the use of RDF triples and SPARQL.

## Contributing

Please see our [contributing guidelines](./CONTRIBUTING.md).

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
