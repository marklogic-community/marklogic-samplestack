Feature: Authentication

  The application allows both authenticated and unauthenticated access through
  login and logout operations. Authenticated users have access to more content
  and features.

  @auth
  Scenario: Try to log in, fail, then succeed
    Given I am a visitor
    And I am using the brief seed data
    When I start to log in
    And I attempt to log in with invalid credentials
    And my login attempt is denied
    And I attempt to log in as a Contributor
    Then I am logged in
