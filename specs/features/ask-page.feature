Feature: Ask Page

  Users who visit the "ask page" of the application should see the "ask"
  state.

  Scenario: The title input is correct
    When I visit the "ask" page
    Then the title input is ""
