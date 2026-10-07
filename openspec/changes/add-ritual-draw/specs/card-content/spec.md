# Spec Delta

## ADDED Requirements

### Requirement: The deck has one card back
The deck SHALL have a single card back image, shown on every face-down card wherever one appears, at the same shape as the card fronts. It SHALL be replaceable by replacing one file. The card back SHALL be treated as decoration: it SHALL carry no information about which card it is.

#### Scenario: Same back everywhere
- **WHEN** face-down cards are shown in the shuffle and in the three positions
- **THEN** every one shows the same card back image

#### Scenario: Turning over keeps its shape
- **WHEN** a face-down card is turned over
- **THEN** its front appears at the same size and shape as its back

#### Scenario: Missing back caught
- **WHEN** the card back file is removed and the checks are run
- **THEN** the checks fail
