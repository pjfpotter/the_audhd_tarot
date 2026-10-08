# Spec Delta

## Purpose

Lets a person shuffle the deck by stimming before they draw, so that the three cards they receive are decided by their own rhythm and movement and by nothing else.

## ADDED Requirements

### Requirement: The person shuffles before drawing
Before the draw the app SHALL present the deck and invite the person to shuffle it, for as long as they like. Shuffling SHALL be optional: the draw control SHALL be available from the first moment, and there SHALL be no minimum, no timer and no prompt to finish.

#### Scenario: Shuffle as long as wanted
- **WHEN** a person shuffles for several minutes without drawing
- **THEN** the app keeps responding to every input and never ends or interrupts the shuffle

#### Scenario: Draw without shuffling
- **WHEN** a person arrives at the shuffle and activates the draw control at once
- **THEN** three cards are drawn

### Requirement: Rhythm and stirring are inputs
Each tap, click or key press on the deck SHALL count as one input (a beat). While a pointer is held down on the deck, its movement SHALL also count as input (a stir). Rhythm alone SHALL be enough: stirring SHALL never be needed.

#### Scenario: A tap is a beat
- **WHEN** a person taps the deck once
- **THEN** one input is registered

#### Scenario: Any key is a beat
- **WHEN** the deck has keyboard focus and a person presses a letter key, Enter or Space
- **THEN** one input is registered for each press

#### Scenario: Stirring adds input
- **WHEN** a person holds a finger on the deck and moves it in circles
- **THEN** inputs are registered for as long as the finger moves

#### Scenario: A single switch is enough
- **WHEN** a person can only press one key or one switch
- **THEN** they can shuffle with it and then draw

### Requirement: The cards are decided by the person's input alone
Every input SHALL be folded into a hidden number, using the kind of input, its timing as precisely as the device reports it, and its position where it has one. The draw activation SHALL itself be folded in. The three cards SHALL then be determined by that number alone: nothing random from the device SHALL be added.

#### Scenario: Same input, same cards
- **WHEN** two shuffles receive exactly the same sequence of inputs with the same timings and positions
- **THEN** they draw the same three cards in the same order

#### Scenario: Different input, different number
- **WHEN** two shuffles differ in the timing of a single input
- **THEN** their hidden numbers differ

#### Scenario: One press is still the person's own
- **WHEN** a person draws without shuffling, twice
- **THEN** the two draws can differ, because the moment of each press is part of its number

### Requirement: Every card stays equally likely
Across the inputs that people actually make, each of the 22 cards SHALL be equally likely to appear in each position, and no card SHALL appear twice in one reading.

#### Scenario: Even spread over many shuffles
- **WHEN** many shuffles are simulated with varied numbers and timings of inputs
- **THEN** every card appears in every position at roughly equal frequency

#### Scenario: Three different cards
- **WHEN** any shuffle is drawn
- **THEN** the three cards are all different

### Requirement: The hidden number is shown as a row of glyphs
The app SHALL show the hidden number as a row of eight glyphs that changes with every input. The glyphs SHALL be decorative: they SHALL NOT be readable as a card name or number, and they SHALL be hidden from screen readers.

#### Scenario: Glyphs roll with input
- **WHEN** a person taps the deck
- **THEN** the row of glyphs changes at once

#### Scenario: Glyphs reveal nothing
- **WHEN** the row of glyphs is shown
- **THEN** it has eight symbols, none of which is a letter or digit

### Requirement: Screen-reader users can tell the shuffle is responding
Because the glyphs are hidden from screen readers, the app SHALL give screen-reader users a spoken count of the inputs made so far, announced politely and no more often than once every two seconds.

#### Scenario: Count announced
- **WHEN** a screen-reader user presses a key several times on the deck and pauses
- **THEN** the number of beats so far is announced

### Requirement: The deck is shown as a cloud of cards
Where the device can run it and motion is not reduced, the deck SHALL be shown as 22 face-down cards in three-dimensional depth among drifting particles. The cloud SHALL be calm at rest, respond visibly to each beat and each stir, and return to calm. Particles SHALL be decoration only and SHALL have no effect on the cards drawn.

#### Scenario: A beat moves the cloud
- **WHEN** a person taps the cloud
- **THEN** the cards near the tap are thrown outward and then settle back

#### Scenario: A stir carries the cloud
- **WHEN** a person drags across the cloud
- **THEN** the cards near the pointer are carried along with it

#### Scenario: Cards stay face down
- **WHEN** the cloud is shown, at rest or in motion
- **THEN** no card face is visible

### Requirement: The draw brings three cards forward
On the draw, three cards SHALL come forward out of the cloud and settle face down in the three positions, in position order, while the rest fall back. The reveal SHALL then proceed as specified for a reading.

#### Scenario: From cloud to positions
- **WHEN** a person activates the draw control over the cloud
- **THEN** three face-down cards come to rest in the three named positions and the first can be turned over

### Requirement: A still deck replaces the cloud when motion is unwanted or unavailable
The app SHALL show a still deck in place of the cloud when reduced motion is in effect, when the device cannot run the three-dimensional scene, or when the person chooses to hold the deck still. With the still deck, rhythm SHALL shuffle exactly as before, the glyphs SHALL be shown larger, and nothing SHALL move: a roll of the glyphs is at most a brief fade.

#### Scenario: Reduced motion
- **WHEN** reduced motion is in effect and a person reaches the shuffle
- **THEN** a still deck and the row of glyphs are shown, with no cloud and no particles

#### Scenario: Device cannot run the scene
- **WHEN** the three-dimensional scene cannot start or stops working
- **THEN** the still deck is shown and the person can shuffle and draw, with no error message

#### Scenario: Same result either way
- **WHEN** the same sequence of beats is made on the still deck and on the cloud
- **THEN** both draw the same three cards

### Requirement: The person can hold the cloud still
While the cloud is shown, a visible control SHALL let the person switch to the still deck and back with one activation. The choice SHALL be remembered on the device.

#### Scenario: Hold still
- **WHEN** a person activates the hold-still control over the cloud
- **THEN** the cloud is replaced by the still deck and nothing is moving

#### Scenario: Choice remembered
- **WHEN** a person has chosen to hold the deck still and opens the app again
- **THEN** the shuffle starts with the still deck

### Requirement: Phone movement is an invitation
Where a device offers motion sensing, the cloud SHALL offer an invitation to let the cards respond to the phone's movement. Until the person accepts, the app SHALL NOT read the phone's movement. Once accepted, tilting SHALL shift the view of the cloud, and a deliberate sway SHALL count as input; sensor jitter SHALL NOT. Declining, or a device with no sensor, SHALL leave everything else working and SHALL show no error.

#### Scenario: Not read until invited
- **WHEN** a person shuffles without accepting the invitation
- **THEN** moving the phone changes nothing on screen and adds no input

#### Scenario: Tilt shifts the view
- **WHEN** a person has accepted and tilts the phone
- **THEN** the nearer cards move across the farther ones

#### Scenario: Declined
- **WHEN** a person declines the device's permission prompt
- **THEN** the invitation is withdrawn, no error is shown, and tapping and stirring work as before

#### Scenario: Holding the phone at any angle
- **WHEN** a person accepts the invitation while holding the phone upright or lying down
- **THEN** that position is treated as level

### Requirement: Starting again starts a new shuffle
When a person starts again, the hidden number SHALL return to its starting value and the deck SHALL be shown ready to shuffle.

#### Scenario: Fresh number
- **WHEN** a person starts again after a reading
- **THEN** the glyphs show the starting number and no earlier input affects the next draw
