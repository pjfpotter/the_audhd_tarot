# Spec Delta

## MODIFIED Requirements

### Requirement: The app is fast to load on a phone
The app's first screen SHALL be usable without waiting for card images or for the shuffle's three-dimensional scene, and a card's image SHALL be loaded by the time that card can be revealed. The code for the three-dimensional scene SHALL be fetched only when a person reaches the shuffle, and the shuffle SHALL be usable while it loads.

#### Scenario: First screen without images
- **WHEN** the app is opened on a slow connection
- **THEN** the landing screen is usable before any card image has finished loading

#### Scenario: No blank reveal
- **WHEN** a person reveals a card
- **THEN** its image is shown immediately, without a blank or partially loaded image

#### Scenario: Scene not loaded on landing
- **WHEN** the app is opened and the person stays on the landing screen
- **THEN** the code for the three-dimensional scene is not requested

#### Scenario: Shuffle usable while the scene loads
- **WHEN** a person reaches the shuffle on a slow connection
- **THEN** the still deck is shown and can be shuffled and drawn from until the cloud is ready
