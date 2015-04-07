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

module.exports = {

  cardinality: function (details) {
    return {
      status: 500,
      details: {
        message: 'Expected only one item, but got ' + details.length + '.',
        items: details
      }
    };
  },
  unsupportedMethod: function (details) {
    return {
      status: 400,
      details: details
    };
  },
  alreadyVoted: function (details) {
    return {
      status: 403,
      details: {
        message: 'Contributor has already voted on the specified content item.'
      }
    };
  },

  mustBeOwner: function (deatals) {
    return {
      status: 403,
      details: {
        message: 'The user does not own the content.'
      }
    };
  }
};
