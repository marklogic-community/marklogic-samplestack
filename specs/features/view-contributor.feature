@view-contributor
Feature: View Contibutor

  Any user may view "contributor detail" about themselves or other contributors
  of content to the system. If the user is a "local contributor", a custom
  dialog displays basic information. If the user is a StackOverflow user, then
  a new window is opened to display that user's StackOverflow profile.

  Scenario: View Contributor Mary
    Given I am "Mary"
    And I am using the brief seed data
    And I visit the "qnadoc" page with id "5dce8909-0972-4289-93cd-f2e8790a17fc"
    And I focus on the question
    And I view the content contributor
    Then the contributor display name is "MaryAdmin"
    And the contributor votes cast are greater than "4"
    And the contributor reputation is greater than "99"
    And dismiss the dialog

  Scenario: View Contributor Joe
    Given I am "Joe"
    And I am using the brief seed data
    And I visit the "qnadoc" page with id "778d0b9c-419f-496a-a300-44815d79708d"
    And I focus on the question
    And I view the content contributor
    Then the contributor display name is "JoeUser"
    And the contributor votes cast are greater than "2"
    And the contributor reputation is greater than "49"
    And dismiss the dialog
