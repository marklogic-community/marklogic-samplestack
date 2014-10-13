Feature: Docs Count

  All accepted QnA docs appear on the landing page when not logged in.

  Scenario:
    Given I am a visitor
    And I am using the brief seed data
    When I visit the landing page
    Then the docs count is "1371"
