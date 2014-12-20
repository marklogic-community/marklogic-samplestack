@landing-page
Feature: Landing Page

  Users who visit the "home page" of the application should see the explore
  state.

  Scenario: The page title is correct
    When I visit the "landing" page
    Then the page title is "explore - samplestack"
