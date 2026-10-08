# Spec Delta

## MODIFIED Requirements

### Requirement: A landing screen introduces the app and leads to a reading
The app SHALL open on the shuffle, with no screen or step before it. That first screen SHALL name the app, say in a sentence or two who it is for and what it offers, and provide one clearly primary control, which draws the reading.

#### Scenario: Opens on the shuffle
- **WHEN** the app is opened
- **THEN** the deck is shown ready to shuffle, together with the app's name and its introduction

#### Scenario: Enter
- **WHEN** a person activates the primary control on the first screen
- **THEN** three face-down cards are dealt

### Requirement: The app is fast to load on a phone
The app's first screen SHALL be usable without waiting for card images or for the shuffle's three-dimensional scene, and a card's image SHALL be loaded by the time that card can be revealed. The code for the three-dimensional scene SHALL NOT be fetched when the still deck is in use because of reduced motion or the person's choice.

#### Scenario: First screen without images
- **WHEN** the app is opened on a slow connection
- **THEN** the landing screen is usable before any card image has finished loading

#### Scenario: No blank reveal
- **WHEN** a person reveals a card
- **THEN** its image is shown immediately, without a blank or partially loaded image

#### Scenario: First screen usable while the scene loads
- **WHEN** the app is opened on a slow connection
- **THEN** the name, the introduction, the still deck and the draw control are shown, and the person can shuffle and draw, until the cloud is ready

#### Scenario: Scene not loaded for the still deck
- **WHEN** the app is opened with reduced motion in effect, or with the deck held still by the person's earlier choice
- **THEN** the code for the three-dimensional scene is not requested
