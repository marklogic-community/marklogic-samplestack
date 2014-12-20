@explore-docs-by-mine-only @explore
Feature: Explore Docs By Mine Only

  When searching for documents, a facet filter may be applied to limit results to
  those documents which created by the user.

  Scenario: As a contributor filtering by mine only, I see the correct results
    Given I am "Joe"
    And I am using the brief seed data
    And I visit the "explore" page
    And I clear all filters
    And I clear the search text
    When I filter documents by mine only = "true"
    Then the docs count is "8"
    When I focus on the "first" search result,
    Then the result "title" is "Q: Mary's Question Number 1"
    When I focus on the "last" search result,
    Then the result "title" is "Q: Joe's Question Number 0"
