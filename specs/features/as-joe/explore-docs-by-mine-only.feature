@explore-docs-by-mine-only @explore
Feature: Explore Docs By Mine Only

  When searching for documents, a facet filter may be applied to limit results to
  those documents which created by the user.

  Scenario: As a contributor filtering by mine only, I see the correct results
    Given I am "Joe"
    When I visit the "ask" page
    And I type "mine only test" as the question title
    And I type "**test**" as the question content
    And I enter "e2eTests" as a question tag
    And I submit the question
    And I visit the "explore" page
    And I clear all filters
    And I clear the search text
    When I filter documents by mine only = "true"
    Then the docs count is less than "100"
