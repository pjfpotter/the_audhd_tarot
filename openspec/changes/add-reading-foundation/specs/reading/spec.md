# Spec Delta

## Purpose

Lets a person draw a three-card reading from the deck and receive it card by card, with each card's art given a full-screen moment before its authored text.

## ADDED Requirements

### Requirement: A reading is three cards in three named positions
A reading SHALL consist of three different cards, one in each of three positions shown in this order and with these names: "Where I am", "How I should travel", "Where I'm going next".

#### Scenario: Three positions
- **WHEN** a reading is drawn
- **THEN** it has exactly three cards, labelled in order "Where I am", "How I should travel" and "Where I'm going next"

#### Scenario: No repeated card
- **WHEN** a reading is drawn
- **THEN** no card appears in more than one position

### Requirement: The draw is fair and happens on the device
Each draw SHALL select its three cards at random with every card equally likely, using a source of randomness on the person's device. No card SHALL be chosen before the person starts the draw.

#### Scenario: Every card can appear
- **WHEN** a large number of readings are drawn
- **THEN** every one of the 22 cards appears, in every position, at roughly equal frequency

#### Scenario: Successive readings differ
- **WHEN** a person draws a reading and then starts again
- **THEN** the second reading is drawn afresh and is not determined by the first

### Requirement: The draw needs only a single activation
A person SHALL be able to start the draw with one activation of one control. The draw SHALL NOT require holding, timing, dragging, a gesture with more than one pointer, or precise aim.

#### Scenario: Keyboard draw
- **WHEN** a person moves focus to the draw control and presses Enter or Space
- **THEN** the reading is drawn

#### Scenario: Single tap draw
- **WHEN** a person taps the draw control once and lifts immediately
- **THEN** the reading is drawn

### Requirement: Cards are revealed one at a time by the person
After the draw the three cards SHALL be presented face down in position order, and each SHALL be revealed only when the person activates it. Cards SHALL be revealable in position order, and the person sets the pace.

#### Scenario: Nothing revealed until asked
- **WHEN** the draw completes
- **THEN** all three cards are face down and no card name, image or text is shown or announced

#### Scenario: Reveal the first card
- **WHEN** the person activates the first face-down card
- **THEN** that card is revealed and the other two stay face down

### Requirement: Each reveal begins with a full-screen art moment
When a card is revealed, its image SHALL fill the viewport, with its number and name, before any reading text is shown. The reading text SHALL then emerge after a short beat without further action, and the person SHALL be able to move on to the text immediately without waiting.

#### Scenario: Art first
- **WHEN** a card is revealed
- **THEN** the card image is shown as large as the viewport allows, uncropped, and no essence, question or unity text is visible yet

#### Scenario: Text emerges after the beat
- **WHEN** the art moment has been shown for its beat and the person has done nothing
- **THEN** the card's reading text becomes visible

#### Scenario: Skip the beat
- **WHEN** the person activates the continue control during the art moment
- **THEN** the reading text is shown at once

### Requirement: The art moment respects reduced motion and assistive technology
With reduced motion in effect, the art moment SHALL appear and give way to the text without animated movement or scaling. For screen-reader users the card's name and image description SHALL be announced at the reveal, and the reading text SHALL be reachable without waiting for any visual transition.

#### Scenario: Reduced motion
- **WHEN** reduced motion is in effect and a card is revealed
- **THEN** the image and then the text appear with no movement, zoom or parallax

#### Scenario: Screen reader reveal
- **WHEN** a screen-reader user reveals a card
- **THEN** the position name, card number, card name and image description are announced, and the reading text follows in reading order

### Requirement: A revealed card shows its authored reading text
A revealed card SHALL show its position name, number, name, aliases, essence line, question, and two or three of its unities chosen at random. Each unity SHALL show its anchor, then its gift labelled "Gift", then its shadow labelled "Shadow". The gift and shadow SHALL always be shown together.

#### Scenario: Reading text content
- **WHEN** a card's reading text is shown
- **THEN** it includes the position name, the card's number, name, aliases, essence and question, and either two or three unities

#### Scenario: Gift and shadow together
- **WHEN** a unity is shown
- **THEN** its anchor, its gift and its shadow all appear, with the gift and shadow labelled in text and not by colour alone

#### Scenario: Unities stay fixed within a reading
- **WHEN** a person moves away from a revealed card and returns to it within the same reading
- **THEN** the same unities are shown as before

### Requirement: The whole reading can be reviewed
Once all three cards are revealed, the person SHALL be able to see the full reading together, in position order, and to return to any card's image.

#### Scenario: Full reading
- **WHEN** the third card has been revealed
- **THEN** all three cards with their positions and reading text are available on one screen in position order

#### Scenario: Return to the art
- **WHEN** the person activates a card's image in the full reading
- **THEN** that card's image is shown large again, and can be dismissed to return to the same place

### Requirement: A person can start again at any time
From any point in a reading the person SHALL be able to start a new reading. Starting again SHALL discard the current reading, and the app SHALL NOT prompt, remind or track how often a person reads.

#### Scenario: Start again
- **WHEN** the person chooses to start a new reading from the full reading
- **THEN** the previous cards are cleared and a new draw can be started

#### Scenario: No pressure mechanics
- **WHEN** a person uses the app across several days
- **THEN** they are shown no streaks, counts, reminders or prompts to return
