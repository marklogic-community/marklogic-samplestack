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

function AskPage () {
  var self = this;
  AskPage.super_.call(self);
  self.url = '/ask';

  // Question title
  Object.defineProperty(self, 'qnaQuestionTitleElement', {
    get: function () {
      return element(by.className('ss-ask-title-input'));
    }
  });

  Object.defineProperty(self, 'qnaQuestionTitle', {
    get: function () {
      return self.qnaQuestionTitleElement.getAttribute('value');
    }
  });

  self.enterQnaQuestionTitle = function (title) {
    return self.qnaQuestionTitleElement
      .clear()
      .sendKeys(title);
  };

  // Question content
  Object.defineProperty(self, 'qnaQuestionContentElement', {
    get: function () {
      return element(by.css('.markdown-input'));
    }
  });

  Object.defineProperty(self, 'qnaQuestionContent', {
    get: function () {
      return self.qnaQuestionContentElement.getAttribute('value');
    }
  });

  Object.defineProperty(self, 'qnaQuestionPreviewTab', {
    get: function () {
      return element(by.className('ss-markdown-editor-preview-tab'));
    }
  });

  Object.defineProperty(self, 'qnaQuestionPreviewElement', {
    get: function () {
      return element(by.css('.ss-markdown-editor-preview div'));
    }
  });

  self.enterQnaQuestionContent = function (content) {
    return self.qnaQuestionContentElement
      .clear()
      .sendKeys(content);
  };

  self.previewQnaQuestionContent = function () {
    return self.qnaQuestionPreviewTab.click();
  };

  // Question tags
  Object.defineProperty(self, 'qnaQuestionTagsElement', {
    get: function () {
      return element(by.model('newTag.text'));
    }
  });

  Object.defineProperty(self, 'qnaQuestionTags', {
    get: function () {
      var tags = element.all(by.css('li.tag-item span')).map(function(elm, index) {
        return elm.getText();
      });
      return tags;
    }
  });

  Object.defineProperty(self, 'qnaQuestionTagsMenu', {
    get: function () {
      return element(by.css('ul.suggestion-list'));
    }
  });

  Object.defineProperty(self, 'qnaQuestionTagsMenuItem', {
    get: function () {
      return element.all(by.css('li.suggestion-item')).first();;
    }
  });

  self.typeQnaQuestionTag = function (tag) {
    return self.qnaQuestionTagsElement
      .clear()
      .sendKeys(tag);
  };

  self.clickQnaQuestionTagsMenuItem = function () {
    return self.qnaQuestionTagsMenuItem.click();
  };

  // Submit button
  Object.defineProperty(self, 'qnaQuestionSubmitElement', {
    get: function () {
      return element(by.buttonText('Post Your Question'));
    }
  });

  Object.defineProperty(self, 'qnaQuestionSubmitIsDisabled', {
    get: function () {
      return self.qnaQuestionSubmitElement.getAttribute('disabled');
    }
  });

  self.submitQnaQuestion = function () {
    return self.qnaQuestionSubmitElement.click();
  };

}

var me = AskPage;
me.pageName = 'ask';
World.addPage(me);
