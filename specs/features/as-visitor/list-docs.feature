@list-docs
Feature: List Docs

  When no search criteria are specified, the explore page lists documents
  **only** according to any applied filters. Such a list is not considered
  a true "search". When listing documents, the results are displayed
  differently. In particular, snippets are not displayed and the default
  sort is different.

  Scenario: As a visitor I can see **some, but not all** of the docs
    Given I am a visitor
    And I am using the brief seed data
    When I visit the "explore" page
    Then the docs count is "1903"
