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

define([
  'json!./contributor.json',
  'json!./question.json',
  'json!./searchResponse.json',
  'json!./searchResult.json',
  'json!./ssSearchInstance.json',
  'json!./tagsResult.json'
], function (
  contributor,
  question,
  searchResponse,
  searchResult,
  ssSearchInstance,
  tagsResult
) {
  return {
    searchResult: searchResult,
    searchResponse: searchResponse,
    contributor: contributor,
    ssSearchInstance: ssSearchInstance,
    question: question,
    tagsResult: tagsResult
  };
});
