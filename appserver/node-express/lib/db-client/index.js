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

var options = sharedRequire('js/options');

var mlclient = require('marklogic');
require('./hookStartRequest');

var boundClients = {};

var execAsTransaction = function (ex) {
  var self = this;
  var txid;

  return this.transactions.open().result()
  .then(function (resp) {
    txid = resp.txid;
    return ex(txid);
  })
  .then(function (result) {
    return self.transactions.commit(txid).result()
    .then(function () {
      return result;
    });
  })
  .catch(function (err) {
    return self.transactions.rollback(txid).result()
    .thenThrow(err);
  });
};

var getClient = function (user, password) {
  return mlclient.createDatabaseClient(_.merge(
    options.middleTier.db.clientConnection,
    {
      user: user,
      password: password
    }
  ));
};

var getBoundClient = function (user, password) {
  if (!boundClients[user]) {
    var connection = getClient(user, password);
    // TODO: this used to work -- determine best way to catch
    // errors in-app and keep logging from being spit out of dbclient
    // connections[role].setLogger({ console: false });

    var boundClient = {};

    var modules = {
      qnaDoc: require('./qnaDoc'),
      contributor: require('./contributor'),
      tags: require('./tags'),
      search: require('./search')
    };

    // have the individual modules handle binding themselves to the connection
    // by calling their exported function
    _.each(modules, function (mod, key) {
      boundClient[key] = mod(connection);
    });
    boundClient.transactions = connection.transactions;
    boundClient.execAsTransaction = execAsTransaction.bind(connection);
    boundClients[user] = boundClient;
  }
  return boundClients[user];
};


module.exports = {
  getBoundClient: getBoundClient,
  getGenericClient: getClient,
  execAsTransaction: execAsTransaction
};
