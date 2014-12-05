Feature: Explore Docs By Text

  When searching for documents, a text filter may be applied to limit results to
  those documents which match the search text criteria.

  @explore-docs-by-text @explore
  Scenario: As a visitor searching for "Math", I see the correct results
    Given I am a visitor
    And I am using the brief seed data
    When I visit the "landing" page
    And I perform a search for "Math"
    Then the docs count is "79"
    And the first result title is "Q: Jquery .each() infinite loop"
    And the last result title is "Q: Random Numbers with JavaScript"

  @explore-docs-by-text @explore
  Scenario: As a contributor searching for "Math", I see the correct results
    Given I am a contributor
    And I am using the brief seed data
    When I visit the "landing" page
    And I perform a search for "Math"
    Then the docs count is "106"
    And the first result title is "Q: Jquery .each() infinite loop"
    And the last result title is "Q: increasing numbers with jQuery"
