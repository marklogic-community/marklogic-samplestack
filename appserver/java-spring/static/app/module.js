/* 
 * Copyright 2012-2015 MarkLogic Corporation 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0 
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and 
 * limitations under the License. 
 */ 

/*
app/module.js

Declare app module as having dependencies on other modules specified by
app/deps.

This module will subsequently be required by each component so that the
components can register themselves int he module.
 */
define(

  ['./deps'],
  function (deps) {

    // rely on deps module to load all dependencies and to expose an array of
    // names, which we assign as dependencies of the module named by the appName
    // build parametwer (see /buildParams.json).
    //
    // TODO: deal with buildParams.json (use such a thing?).
    //

    /**
     * @ngdoc module
     * @name app
     *
     * @description
     * The `app` module is the Samplestack application module. It is an
     an implementation of a MarkLogic-based
     * AngularJS application. It depends on and uses the components of the
     * _marklogic module.
     *
     * At present, Angular.js does not provide strong support for documenting
     * *applications*, as opposed to libraries. As such, certain parts of the
     * documentation for the application may seem unwieldy. We have documented
     * controllers, dialogs and states using customized templates.
     *
     * The dev team has started conversations with the Angular devs on how to
     * go about documenting these types of objects and may have early access
     * to better methods for documentation. That said, the current
     * implementation of the docs is expected to be adequate.
     */
    return angular.module('app', deps);
  }

);
