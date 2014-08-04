Feature: Landing Page

  https://github.com/marklogic/samplestack-angular/features/landing-page/landing-page.md

  Scenario:
    Given I visit the app at the root url
    Then I see the explore page
    And no search criteria are applied
    And I see search results
