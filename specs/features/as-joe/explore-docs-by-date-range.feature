@explore-docs-by-mine-only @explore @broken
Feature: Explore Docs By Date Range

  When searching for documents, a facet filter may be applied to limit results to
  those documents which created by the user.

  Scenario: As a contributor filtering by date range, I see the correct results
    Given I am "Joe"
    When I visit the "explore" page
    And I clear all filters
    And I clear the search text
    When I filter documents by from date = "01/01/2011"
    Then the docs count is "2463"
    When I focus on the "first" search result,
    Then the result "title" is "Q: mine only test"
    When I filter documents by from date = "12/01/2012"
    Then the docs count is "627"
    When I focus on the "first" search result,
    Then the result "title" is "Q: JS split() function that ignores separator appearing inside quotation marks"
