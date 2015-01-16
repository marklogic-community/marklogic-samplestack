@explore-docs-by-resolved-only @explore
Feature: Explore Docs By Resolved Only

  When searching for documents, a facet filter may be applied to limit results to
  those documents which are only resolved.

  Scenario: As a contributor filtering by resolved only, I see the correct results
    Given I am a contributor
    And I am using the brief seed data
    And I visit the "explore" page
    And I clear all filters
    When I filter documents by resolved only = "true"
    Then the docs count is "1903"
    When I focus on the "first" search result
    Then the result "title" is "Q: Mary's Question Number 0"
    When I focus on the "last" search result
    Then the result "title" is "Q: Show modal if page refreshed, but not if a link is followed"
