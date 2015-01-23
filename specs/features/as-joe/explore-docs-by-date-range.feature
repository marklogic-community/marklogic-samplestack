@explore-docs-by-date-range @explore
Feature: Explore Docs By Date Range

  When searching for documents, a facet filter may be applied to limit results to
  those documents which created by the user.

  Scenario: As a contributor filtering by date range, I see the correct results
    Given I am "Joe"
    When I visit the "explore" page
    And I clear all filters
    When I filter documents by to date = "12/01/2012"
    And I press key enter in to date
    Then the docs count is "1181"
    When I focus on the "first" search result,
    Then the result "title" is "Q: JS split() function that ignores separator appearing inside quotation marks"
    When I filter documents by from date = "01/01/2011"
    And I press key enter in from date
    Then the docs count is "1004"
    When I focus on the "last" search result,
    Then the result "title" is "Q: Javascript: Easiest way to make a list of elements"
