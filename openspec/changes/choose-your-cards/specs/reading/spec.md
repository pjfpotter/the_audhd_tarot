# Spec Delta

## MODIFIED Requirements

### Requirement: The cards come from the person's choice
The three cards of a reading SHALL be the three cards the person chose, in the order of the three spaces, with no card twice. The unities shown for each card SHALL be chosen at random from the device's own randomness. Nothing about the person's taps, stirs or timing SHALL be used.

#### Scenario: The reading is the hand
- **WHEN** a person has chosen three cards and lays them out and turns them over
- **THEN** the cards are those chosen, in the order of the spaces

#### Scenario: A card that is not in the deck
- **WHEN** a reading is made from a card number that is not in the deck
- **THEN** it is refused
