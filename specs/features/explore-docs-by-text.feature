@explore-docs-by-text @explore
Feature: Explore Docs By Text

  When searching for documents, a text filter may be applied to limit results to
  those documents which match the search text criteria.

  Scenario: As a visitor searching for "Math", I see the correct results
    Given I am a visitor
    And I am using the brief seed data
    When I visit the "explore" page
    And I perform a search for "Math"
    Then the docs count is "52".
    When I focus on the "first" search result,
    Then the result "title" is "Q: Get element -moz-transform:rotate value in jQuery"
    When I focus on the "last" search result,
    Then the result "title" is "Q: Nested For loop for initializing array of arrays for Javascript"

  Scenario: As a contributor searching for "Math", I see the correct results
    Given I am a contributor
    And I am using the brief seed data
    When I visit the "explore" page
    And I perform a search for "Math"
    Then the docs count is "71".
    When I focus on the "first" search result,
    Then the result "title" is "Q: getting random element from array returns same element"
    When I focus on the "last" search result,
    Then the result "title" is "Q: Length of Number in JavaScript"
