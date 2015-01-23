@ask-question
Feature: Ask Question

  Any Contributor may ask questions with Markdown formatting, associating one or
  more (existing) "tags" with the question.

  Scenario: Ask a question with Markdown preview
    Given I am "Mary"
    And my user name is "MaryAdmin"
    When I visit the "ask" page
    And I type "" as the question title
    Then the submit button is disabled
    When I type "foo" as the question title
    And I type "**bar**" as the question content
    And I enter "javascr" as a question tag
    Then the question title is "foo"
    And the question content is "**bar**"
    And the question tags menu appears
    And the submit button is not disabled
    And the previewed content is not displayed
    When I click a question tag in the menu
    Then the question tag is "javascript"
    When I preview the content
    Then the previewed content is displayed
    And the previewed content has "strong" formatting
    And I submit the question
    Then the page title is "doc - samplestack"
    # TODO check that doc page has submitted content
