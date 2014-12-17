@vote-on-question
Feature: Vote on Question

  Contributors may vote questions up or down. One may only vote on a question
  once. When an upvote is made to a quesiton, the author of the question
  gains reputation points. When a downvote is made to a  question, the author
  of the question loses reputation points.

  @broken @363
  Scenario: Mary votes for Joe's question
    Given I am "Mary"
    And I am using the brief seed data
    When I visit the "qnadoc" page with id "6c90b1cf-2cd8-4a8d-87ae-0c6d5182d301"
    And I focus on the question
    And the content contributor reputation is known as "reputation"
    And I vote it up
    Then the content contributor reputation is greater than "reputation"
