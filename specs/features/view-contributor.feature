@view-contributor
Feature: View Contibutor

  Any user may view "contributor detail" about themselves or other contributors
  of content to the system. If the user is a "local contributor", a custom
  dialog displays basic information. If the user is a StackOverflow user, then
  a new window is opened to display that user's StackOverflow profile.

  @broken
  Scenario: View Contributor Mary
    Given I am "maryAdmin"
    And I am using the brief seed data
    And I visit the "explore" page
    And I clear all filters
    And I clear the search text
    And I filter documents by mine only = "true"
    And I focus on search result item "0"
    And I view the content contributor
    Then the contributor display name is "xyz"
    And the contributor votes cast are "5"
    And the contributor reputation is "100"

  @broken
  Scenario: View Contributor Joe
    Given I am "joeUser"
    And I am using the brief seed data
    And I visit the "explore" page
    And I clear all filters
    And I clear the search text
    And I filter documents by mine only = "true"
    And I focus on search result item "0"
    And I view the content contributor
    Then the contributor display name is "xyz"
    And the contributor votes cast are "5"
    And the contributor reputation is "100"
