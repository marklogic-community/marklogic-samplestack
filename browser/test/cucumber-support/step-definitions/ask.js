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

module.exports = function () {
  this.World = World;

  // Question title
  this.When(
    /type "(.*)" as the question title/,
    function (title, next) {
      this.currentPage.enterQnaQuestionTitle(title).then(next);
    }
  );

  this.Then(
    /question title is "(.*)"/,
    function (title, next) {
      expect(this.currentPage.qnaQuestionTitle)
          .to.eventually.equal(title).and.notify(next);
    }
  );

  // Question content
  this.When(
    /type "(.*)" as the question content/,
    function (content, next) {
      this.currentPage.enterQnaQuestionContent(content).then(next);
    }
  );

  this.Then(
    /question content is "(.*)"/,
    function (content, next) {
      expect(this.currentPage.qnaQuestionContent)
        .to.eventually.equal(content).and.notify(next);
    }
  );

  this.Then(
    /previewed content has "(.*)" formatting/,
    function (tagName, next) {
      expect(this.currentPage.qnaQuestionPreviewElement
        .isElementPresent(by.css(tagName)))
        .to.eventually.equal(true).and.notify(next);
    }
  );

  this.When(
    /preview the content/,
    function (next) {
      this.currentPage.previewQnaQuestionContent().then(next);
    }
  );

  this.Then(
    /previewed content is( not)? displayed/,
    function (status, next) {
      expect(this.currentPage.qnaQuestionPreviewElement.isDisplayed())
        .to.eventually.equal(status ? false : true).notify(next);
    }
  );

  // Question tags
  this.When(
    /enter "(.*)" as a question tag/,
    function (tag, next) {
      this.currentPage.typeQnaQuestionTag(tag).then(next);
    }
  );

  this.Then(
    /question tags menu appears/,
    function (next) {
      expect(this.currentPage.qnaQuestionTagsMenu)
        .to.eventually.exist.and.notify(next);
    }
  );

  this.When(
    /click a question tag in the menu/,
    function (next) {
      this.currentPage.clickQnaQuestionTagsMenuItem().then(next);
    }
  );

  this.Then(
    /question tag is "(.*)"/,
    function (tag, next) {
      var tags = [tag];
      if (
        browser.caps.browserName ===  'internet explorer' &&
        browser.caps.version === '9'
      ) {
        next();
      }
      else {
        expect(this.currentPage.qnaQuestionTags)
          .to.eventually.deep.equals(tags).and.notify(next);
      }
    }
  );

  // Question submit
  this.Then(
    /submit button is( not)? disabled/,
    function (status, next) {
      expect(this.currentPage.qnaQuestionSubmitIsDisabled)
        .to.eventually.equal(status ? null : 'true').notify(next);
    }
  );

  this.Then(
    /submit the question/,
    function (next) {
      this.currentPage.submitQnaQuestion().then(this.notifyOk(next));
    }
  );

  this.Given(
    /the question id is known as "(.*)"/,
    function (qid, next) {
      var self = this;
      browser.getCurrentUrl().then(function (url) {
        self[qid] = url.substring(url.lastIndexOf('/') + 1);
        next();
      });
    }
  );
};
