# Spec Delta

## REMOVED Requirements

### Requirement: The draw is fair and happens on the device

**Reason**: The cards are no longer picked by the device's own randomness. They are determined by the person's shuffle, which is the point of the ritual draw.

**Migration**: Fairness and "no card chosen before the person acts" are now required by the `shuffle` capability ("The cards are decided by the person's input alone" and "Every card stays equally likely").

## ADDED Requirements

### Requirement: The draw follows the shuffle
A reading SHALL be drawn from the person's shuffle: the three cards SHALL be those determined by the shuffle's hidden number at the moment of the draw. No card SHALL be chosen before the person activates the draw, and the draw SHALL happen entirely on the person's device.

#### Scenario: Cards come from the shuffle
- **WHEN** a person shuffles and then activates the draw control
- **THEN** the three cards dealt are the ones the shuffle's number determines

#### Scenario: Nothing chosen early
- **WHEN** a person is still shuffling
- **THEN** no cards have been chosen, and further input can still change which are drawn

#### Scenario: Successive readings differ
- **WHEN** a person draws a reading and then starts again
- **THEN** the second reading comes from a new shuffle and is not determined by the first
