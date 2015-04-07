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

var roles = [ 'contributors', 'default' ];

module.exports = function (app, mw) {
  app.post('/v1/tags', [
    mw.auth.tryReviveSession,
    mw.auth.associateBestRole.bind(app, roles),
    mw.parseBody.json,

    function (req, res, next) {
      // Handle related tags
      if (req.body.search.relatedTo) {
        return req.db.tags.getRelatedTags(req.body)
        .then(function (result) {
          // TODO make it work
          return res.status(200).send(result);
        })
        .catch(next);
      }
      // Handle typeahead, more tags, and ask tags
      else {
        return req.db.tags.getTags(req.body)
        .then(function (result) {
          return res.status(200).send(result);
        })
        .catch(next);
      }
    }

  ]);
};
