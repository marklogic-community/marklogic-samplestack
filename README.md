# sasquatch

An application to demonstrate using MarkLogic in a Java Application Server environment.

## Usage

Install MarkLogic Server (Only builds with trunk Client Java API -FIXME)

Check out code

git clone https://github.com/marklogic/sasquatch.git

Current steps to get running (not gradelized)

1. install and start MarkLogic with fresh data dir
2. ./gradlew markLogicInit          sets up MarkLogic
3. ./gradlew markLogicApplication   configures application
4. ./gradlew loadGithub   invokes a gradle task to load a small set of github files.
5. ./gradlew test  runs unit tests
6. ./gradlew bootRun  runs the application, localhost:8080

Endpoints currently supported
/docs
/foo
/tags
/

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

