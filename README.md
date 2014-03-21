# sasquatch

An application to demonstrate using MarkLogic in a Java Application Server environment.

## Usage

Install MarkLogic Server (Only builds with trunk Client Java API -FIXME)

Check out code

git clone https://github.com/marklogic/sasquatch.git

TODO: bootstrap tasks  look in /scripts/ for existing bootstrap/setup tasks

Current steps to get running (not gradelized)

1. install and start MarkLogic with fresh data dir
2. sh scripts/init-bootstrap.sh   initialized MarkLogic, makes a REST API Instance
3. sh scripts/packages.sh   does database config, appserver setup
4. ./gradlew loadTestGithub   invokes a gradle task to load a small set of github files.
5. ./gradlew test  runs unit tests
6. ./gradlew war   builds web application artifact
7. ./gradlew runJetty9   runs jetty on that war.

If you get that far, let's talk endpoints


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

