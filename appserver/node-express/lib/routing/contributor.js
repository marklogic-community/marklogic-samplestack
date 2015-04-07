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

var roles = ['default'];

module.exports = function (app, mw) {
  // app.get('/v1/contributors', [
  //   mw.auth.tryReviveSession,
  //   mw.auth.associateBestRole.bind(app, roles),
  //
  //   function (req, res, next) {
  //     return req.db.getContributors(
  //       { q: req.query.q, start: req.query.start }
  //     )
  //     .then(function (contributors) {
  //       return res.status(200).send(contributors);
  //     })
  //     .catch(next);
  //   }
  // ]);

  app.get('/v1/contributors/:id', [
    mw.auth.tryReviveSession,
    mw.auth.associateBestRole.bind(app, roles),

    function (req, res, next) {
      return req.db.contributor.getUniqueContent(
        null, { id: req.params.id }
      )
      .then(function (contributor) {
        return res.status(200).send(contributor);
      })
      .catch(next);
    }
  ]);
};
