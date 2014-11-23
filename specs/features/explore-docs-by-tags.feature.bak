Feature: Explore Docs By Tags

  When sesarching for documents, a filter may be applied to limit results to
  those documents which individually match one or more tags. The results
  indicate the count of tags found in the documents.

  Scenario: Lookup tags in main search
    Given I am a visitor
    And I am using the brief seed data
    When I visit the landing page
    And I lookup tags that match "j"
    Then the tags lookup list should display
      | javascript  | 291 |
      | java        | 210 |
      | node.js     | 185 |
      | json        | 160 |
      | jquery      | 35  |

  Scenario: Select tag from lookup in main search
    Given I am a visitor
    And I am using the brief seed data
    When I visit the landing page
    And I lookup tags that match "j"
    And I select "javascript"
    Then the results count should equal "291"
    And the selected tags should display
      | javascript  | 291 |
