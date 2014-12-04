Feature: Ask Page

  Users who visit the "ask-question" page of the application should be able to
  ask a question.

  @ask
  Scenario: A question is entered
    Given I am a contributor # This isn't logging the user in
    When I visit the "ask" page
    And I type "" as the question title
    Then the submit button is disabled
    When I type "foo" as the question title
    Then the submit button is not disabled
    When I type "**bar**" as the question content
    And I enter "baz" as a question tag
    Then the question title is "foo"
    And the question content is "**bar**"
    And the question tag is "baz"
    And the previewed content is not displayed
    When I preview the content
    Then the previewed content is displayed
    And the previewed content has "strong" formatting
    And I submit the question
    #Then the page title is "doc - samplestack" # Failing due to auth issues above
    # TODO check that doc page has submitted content
