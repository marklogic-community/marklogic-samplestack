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
_marklogic/marklogic.js

Define marklogic.sample module with all components loaded.
 */

define(['./module', './components'], function (module) {

  // Each referenced component is responsible for defining itself and adding
  // itself to the module.
  //
  // It is thus sufficient to return the module now -- we have forced
  // all components to be defined and included.

  return module;

});
