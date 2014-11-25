# marklogic-samplestack

README for Version 1.0.0-ea3

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
* MarLogic 8.0 Early Acceess Release 3 (EA3) (see instructions [below](#getting-started))
* git

Beyond these prerequisites, see the [Java README](appserver/java-spring/README.md) for instructions on setting up the Java middle tier.

## Getting Started

Follow this procedure to set up Samplestack in your environment.

1. Install MarkLogic 8 Early Access 3 (EA3). See http://ea.marklogic.com/download.

2. Start MarkLogic. For details, see the [MarkLogic Installation Guide](http://docs.marklogic.com/guide/installation/procedures#id_92457).

3. Clone this repository. For example, run the following command:  

    ```
    git clone https://github.com/marklogic/marklogic-samplestack
    ```

4. CHOICES:
    1. [Set up the Java middle tier and database tiers with gradle](appserver/java-spring/README.md)
    2. [Set up the Node middle and database tiers with gulp](appserver/node-express/README.md)
    3. [Set up the browser tier](broser/README.md)


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
