Feature: Explore Docs By Mine Only

  When searching for documents, a facet filter may be applied to limit results to
  those documents which created by the user.

  @broken @explore-docs-by-mine-only @explore
  Scenario: As a contributor filtering by mine only, I see the correct results
    Given I am a contributor
    And I am using the brief seed data
    When I visit the "landing" page
    And I select the filter mine only
    Then the docs count is "8"
    And the first result title is "Q: Mary's Question Number 1"
    And the last result title is "Q: Joe's Question Number 0"
