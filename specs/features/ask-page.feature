Feature: Ask Page

  Users who visit the "ask page" of the application should see the "ask"
  state.

  @ask
  Scenario: The title input is correct
    Given I am a contributor
    When I visit the "ask" page
    Then the question title is ""
