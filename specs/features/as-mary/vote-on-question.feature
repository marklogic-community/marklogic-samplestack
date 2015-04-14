@broken @vote-on-question @vote
Feature: Vote on Question

  Contributors may vote questions up or down. One may only vote on a question
  once. When an upvote is made to a quesiton, the author of the question
  gains reputation points. When a downvote is made to a  question, the author
  of the question loses reputation points.

  Scenario: Mary votes for Joe's question
    Given I am "Joe"
    When I visit the "ask" page
    And I type "test votes" as the question title
    And I type "**test**" as the question content
    And I enter "e2eTests" as a question tag
    And I submit the question
    And the question id is known as "qid"
    And I am "Mary"
    When I visit the "qnadoc" page with id equal to "qid"
    And I focus on the question
    And the content contributor reputation is known as "reputation"
    And I vote it up
    Then the content contributor reputation is greater than "reputation"
