Feature: Explore Docs By Resolved Only

  When searching for documents, a facet filter may be applied to limit results to
  those documents which are only resolved.

  @explore-docs-by-resolved-only @explore
  Scenario: As a contributor filtering by resolved only, I see the correct results
    Given I am a contributor
    And I am using the brief seed data
    When I visit the "landing" page
    And I select the filter resolved only
    Then the docs count is "2131"
    And the first result title is "Q: Mary's Question Number 0"
    And the last result title is "Q: JQuery function returning before $.each complete"
