Feature: Identification, Authentication and Authorization (IAA)

  https://github.com/marklogic/samplestack-angular/features/id-auth-auth/id-auth-auth.md

  Scenario:
    Given I am a visitor
    And I have valid credentials
    Then I can log in as a contributor

  Scenario:
    Given I am a visitor
    And I do not have valid credentials
    Then I cannot log in as a contributor

  Scenario:
    Given I am a contributor
    Then I can log out

  Scenario:
    Given I am a visitor
    Then I cannot press the button to ask a question

  Scenario:
    Given I am a visitor
    Then I cannot visit the ask page

  Scenario:
    Given I am a visitor
    Then I cannot explore unresolved questions

  Scenario:
    Given I am a visitor
    Then I cannot see an unresolved question
