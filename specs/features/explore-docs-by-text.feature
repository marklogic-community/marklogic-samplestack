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
    Then the result "title" is "Q: Moving an object along a straight line at a constant speed from point A to B"
    When I focus on the "last" search result,
    Then the result "title" is "Q: Var is undefined"

  Scenario: As a contributor searching for "Math", I see the correct results
    Given I am a contributor
    And I am using the brief seed data
    When I visit the "explore" page
    And I perform a search for "Math"
    Then the docs count is "71".
    When I focus on the "first" search result,
    Then the result "title" is "Q: Why would I combine Math.floor with Math.random?"
    When I focus on the "last" search result,
    Then the result "title" is "Q: Value from input in quotes javascript"
