# Spec Delta

## Purpose

Lets a person mix the deck and then choose the three cards of their reading, so that the cards they are given are the cards they took hold of.

## ADDED Requirements

### Requirement: Mixing comes before choosing
The shuffle SHALL be the app's first screen and SHALL have two parts, mixing and choosing. The app SHALL open on mixing. A control SHALL move from mixing to choosing, and in choosing a control SHALL return to mixing and empty the spaces. There SHALL be no minimum time or amount of mixing and no timer.

#### Scenario: Open on shuffling
- **WHEN** a person opens the app
- **THEN** the deck is shown alone, with the instruction to shuffle it and a control to draw cards, and no spaces for the cards

#### Scenario: The spaces come with the draw
- **WHEN** a person activates the control to draw cards
- **THEN** three empty spaces named for the three positions of the reading appear

#### Scenario: Mix as long as wanted
- **WHEN** a person mixes for several minutes without choosing
- **THEN** the app keeps responding and never ends or interrupts the mixing

#### Scenario: Shuffle again
- **WHEN** a person has chosen some cards and activates the control to shuffle again
- **THEN** the spaces are gone and the deck is being shuffled

### Requirement: Every card is a particular card
Each of the 22 cards in the deck SHALL be one particular card from the moment the deck appears until the reading is laid out. The deck SHALL be shown face down, and nothing about which card is which SHALL be visible or exposed to assistive technology before the reading is laid out. Which card starts where SHALL be random each time, from the device's own randomness.

#### Scenario: The card touched is the card chosen
- **WHEN** a person takes hold of a card and puts it in a space
- **THEN** that card is the card in that position of the reading

#### Scenario: Starts differently each time
- **WHEN** a person opens the shuffle on several visits
- **THEN** the cards do not start in the same places

#### Scenario: Nothing given away
- **WHEN** a screen reader reads the deck or the face-down cards
- **THEN** it reads places in the layout, such as "Card 5 of 22", and never a card's name or number

### Requirement: Shuffling changes which cards are on top
In the cloud, stirring SHALL change which cards are on top of the pile and which are underneath, and cards SHALL be drawn one over another without cutting into each other.

#### Scenario: A new order
- **WHEN** a person stirs the cloud briskly for a few seconds
- **THEN** cards that were on top are underneath others, and no card cuts through another

### Requirement: A touch is gentle and the cards stay in view
In the cloud, a touch SHALL disturb only the cards near it. No amount of tapping, dragging or scrubbing SHALL move a card out of the clear part of the screen.

#### Scenario: A tap moves its neighbours
- **WHEN** a person taps the cloud
- **THEN** the cards beside the finger move and the others do not

#### Scenario: A hard scrub
- **WHEN** a person drags back and forth across the whole cloud, fast and repeatedly
- **THEN** the cards swirl and remain on the screen

### Requirement: Cards are chosen into three spaces
In choosing, a person SHALL be able to take hold of the card under their finger and carry it into one of three spaces, named for the positions of the reading. A card let go over a space SHALL stay in the space it is nearest that is empty; a card let go anywhere else SHALL return to the deck. A space that holds a card SHALL put it back when activated. No more than three cards SHALL be held, and each card at most once.

#### Scenario: Carry a card to a space
- **WHEN** a person presses on a card and drags it over a space and lets go
- **THEN** the card is in that space

#### Scenario: Let go elsewhere
- **WHEN** a person lets go of a card away from the spaces
- **THEN** it returns to the deck and the spaces are unchanged

#### Scenario: Put a card back
- **WHEN** a person activates a space that holds a card
- **THEN** the card returns to the deck and the other spaces are unchanged

#### Scenario: Three at most
- **WHEN** all three spaces are full and a person tries to choose another card
- **THEN** nothing is chosen and the person is told the spaces are full

### Requirement: The reading is laid out from the spaces
The control to lay out the cards SHALL be unavailable until all three spaces hold a card. Activating it SHALL show the table of three face-down cards, the card from each space in the position of that space.

#### Scenario: Lay out
- **WHEN** all three spaces hold cards and a person activates the control
- **THEN** the table shows three face-down cards, and turning them over shows the cards that were in the spaces, in order

### Requirement: Choosing never needs a drag
Every choice SHALL be possible without dragging. In the cloud, Enter or Space on the deck SHALL take the card nearest the middle; arrow keys SHALL still stir and other keys SHALL take nothing. A press from assistive technology SHALL do the same. When the third card is chosen, focus SHALL move to the control to lay out the cards.

#### Scenario: Keyboard
- **WHEN** the deck has focus in choosing and a person presses Enter three times
- **THEN** three different cards are in the spaces and focus is on the control to lay them out

### Requirement: Where there is no cloud, the cards are face down to tap
When reduced motion is in effect, the device cannot run the cloud, the person has chosen to hold it still, or the cloud has not loaded, mixing SHALL be a deck that any tap or key reshuffles, and choosing SHALL show the 22 face-down cards as controls. Tapping a card SHALL put it in the first empty space. A chosen card SHALL leave its place in the layout marked as chosen, not removed. Only a brief fade SHALL move, and nothing at all if the person asks for no motion.

#### Scenario: Tap to choose
- **WHEN** a person taps a face-down card
- **THEN** that card is in the first empty space and its place in the layout is marked as chosen

#### Scenario: Changing presentation keeps the choice
- **WHEN** a person has chosen cards in the cloud and holds it still
- **THEN** the same cards are in the spaces and their places are marked as chosen

### Requirement: Progress is announced by place, never by card
A status region SHALL say which space was filled or emptied and how many remain, and SHALL NOT say which card.

#### Scenario: Announcement
- **WHEN** a person chooses the first card
- **THEN** the status reads that the first position has a card and that two more are to choose

### Requirement: Nothing is derived from how a person taps or moves
The app SHALL NOT fold a person's timing, position or movement into the choice of cards and SHALL NOT read the phone's movement.
