# Samplestack Web Application

> Understanding, Installing, running and developing the browser tier of marklogic-samplestack

## Understanding

The Samplestack web application is built with AngularJS. It is built to run from a static web server and to access the Samplestack middle-tier via AJAX. Because of this, the browser may easily be run with *either* the Node.js __or__ the Java middle-tier.

Samplestack is configured to allow Java developers running the Java/Spring-based middle-tier to use a pre-built instance of the browser application with the Spring server -- **all hosted on port 8090 by default**. For information on running that combination, please see the [Java/Spring README](../appserver/java-spring/README.md)

This document describes automation options for developers who wish to run the Java/Spring middle-tier with a **dynamically built and separately hosted** version of the Browser application.

In this configuration, the Java middle-tier and the dynamically built web application are proxied together on port 3000 in order to make the browser development activities (such as "watch mode" work efficiently, and to simplify networking when running locally.

Before you begin in this configuration, please see follow the instructions from the [JavaScript README](../README-JavaScript.md), specifically the [prerequisites](../README-JavaScript.md#Prerequisites) and [one-time setup](../README-JavaScript.md#One-Time-Setup) instructions.

## Browser Development with Java

You can run the live, dynamically built version of the Samplestack browser with a separately launched instance of Java middle-tier.

You can also execute end-to-end tests of this configuration, where the browser code is tested with the Java middle-tier.

We'll call this kind of development a **mixed environment**. These configurations are discussed below.

### Running the Application in a Mixed Environment

A Java developer who wants to run both the Java-middle-tier code and the "live" dynamically built browser on port 3000 (as opposed to the pre-built version on port 8090) does so by using two terminal window -- one for the Java middle-tier (using gradle) and one for the browser (using gulp).

The gradle commands are the same as those discussed in thge [Java/Spring README](../appserver/java-spring/README.md).

The gulp commands `watch` and `run`, which are documented in the [JavaScript README](../README-JavaScript.md) are run in a second terminal. To cause the browser to use the **Java** middle-tier server, simply append the flag `--middle-tier=external` to those commands, e.g.

```
gulp run --middle-tier=external
```

In this configuration, the browser is hosted on port 3000 (http://loalhost:3000/), and the Java middle-tier server, which runs on port 8090, is **proxied** onto port 3000. Thus, the browser is not reconfigured to use a different port for its REST calls, but rather the Java REST endpoints appear on port 3000 in addition to their "normal" home on port 8090.

### End-To-End testing the Mixed Environment

The behavior of the `gulp e2e` command is discussed in general in the [JavaScript README](../README-JavaScript). The following flags may be included in `gulp e2e` commands to run them in mixed mode.

- `middle-tier=external`: use this flag to cause e2e tests to be run against the Java middle-tier, when you have already launched the Java middle-tier code in a separate terminal (and you have a **clean and complete** database setup already performed).
- `middle-tier=java`: use this flag to cause e2e tests to use the gradle commands themselves to configure/reconfigure the database "from scratch", and then automatically launch the Java middle-tier.

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
