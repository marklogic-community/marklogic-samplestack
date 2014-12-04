Feature: List Docs

  All accepted QnA docs appear on the landing page when not logged in.

  @explore
  Scenario: As a visitor I can see **some, but not all** of the docs
    Given I am a visitor
    And I am using the brief seed data
    When I visit the "explore" page
    Then the docs count is "2131"
