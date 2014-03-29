# sasquatch

An application to demonstrate using MarkLogic in a Java Application Server environment.

## Usage


```bash
git clone https://github.com/marklogic/sasquatch.git
git checkout develop
```

One-time setup:

1. install and start MarkLogic with fresh data dir
2. build and install ML java client from trunk as Maven package
3. `./gradlew markLogicInit`          sets up MarkLogic
4. `./gradlew markLogicApplication`   configures application
5. `./gradlew loadGithub`   invokes a gradle task to load a small set of github files.

To run unit tests:

* `./gradlew test`


To run the application:

* `./gradlew run` -- builds and runs the app (on localhost:8080) and enters
watch mode (subsequent changes are instantaneously applied to the running
server)

### Endpoints currently supported

* /docs
* /foo
* /tags
* /

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

