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

var utilities = require('../utilities');
var Metadata = require('./directives/qnaDocMetadataConstructor.dctv').Metadata;

function QnaDocPage () {
  var self = this;
  QnaDocPage.super_.call(self);
  self.url = '/doc';

  require('./dialogs/contributor.dlg').support(self);

  self.focusQuestion = function () {
    return self.qself(getQuestionElement().then(function (el) {
      self.focusedItem = {};
      return getQuestionMetadata().then(function (meta) {
        self.focusedItem.metadata = meta;
        return;
      });
    }));
  };

  self.questionVoteUp = function () {
    return self.qself(
      element(by.className('ss-question-votes'))
      .element(by.className('ss-vote-control-up'))
      .click()
    );
  };

  /*******************************/
  /********** PRIVATE ************/
  /*******************************/
  var getQuestionElement = function () {
    return element(by.className('ss-question'));
  };

  var getQuestionMetadata = function () {
    return getQuestionElement().then(function (el) {
      return new Metadata(el, self);
    });
  };

}

var me = QnaDocPage;
me.pageName = 'qnadoc';
World.addPage(me);
