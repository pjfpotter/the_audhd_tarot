# card-content Specification

## Purpose

Defines the deck as data: the 22 major arcana of The AuDHD Tarot and the authored text and imagery each card carries, so that readings are built only from the author's own writing.

## Requirements

### Requirement: The deck is the 22 major arcana in Marseille order
The deck SHALL contain exactly 22 cards numbered 0 to 21 with no gaps or duplicates, in Marseille order: card 8 is Justice and card 11 is Force.

#### Scenario: Complete deck
- **WHEN** the deck is loaded
- **THEN** it contains 22 cards whose numbers are exactly 0 through 21

#### Scenario: Marseille numbering
- **WHEN** cards 8 and 11 are looked up
- **THEN** card 8 is Justice and card 11 is Force

### Requirement: Each card carries its authored text
Each card SHALL have a name, zero or more aliases, one essence line, one question, and at least three unities. Each unity SHALL have an anchor, a gift and a shadow, all non-empty.

#### Scenario: Card fields present
- **WHEN** any card is looked up
- **THEN** it has a non-empty name, essence and question, and at least three unities

#### Scenario: Unity fields present
- **WHEN** any unity of any card is looked up
- **THEN** its anchor, gift and shadow are all non-empty text

### Requirement: Card text matches the v1 prototype
The card text SHALL be the text of the v1 prototype, carried over without rewording: the same 22 names, aliases, essence lines and questions, and the same 68 unities, with v1's "superpower" presented as the gift and v1's "trap" presented as the shadow.

#### Scenario: Unity count preserved
- **WHEN** the unities of all cards are counted
- **THEN** the total is 68, and The Fool has five

#### Scenario: Text preserved
- **WHEN** a card's essence, question and unities are compared with the v1 prototype
- **THEN** the wording is identical

### Requirement: Each card has an image and a written description
Each card SHALL have exactly one image and one written description of what that image shows. The description SHALL describe the image actually displayed, in plain language, without interpreting the card's meaning.

#### Scenario: Image and description present
- **WHEN** any card is looked up
- **THEN** it has an image that loads and a non-empty description

#### Scenario: Description matches the displayed art
- **WHEN** the description of card 1 is read alongside its image
- **THEN** the description names what is visibly in that image, such as the figure, the table and the objects on it

### Requirement: Card art is replaceable by card number
Card images SHALL be addressed by card number alone, so that replacing the image files for some or all cards changes the art shown without any other change to the app.

#### Scenario: Art swapped
- **WHEN** the image file for card 13 is replaced with a different image of the same number
- **THEN** the app shows the new image for card 13 everywhere that card appears

### Requirement: Invalid deck content is rejected before release
The project SHALL fail its automated checks when the deck breaks any requirement in this capability, including a missing card, a duplicate number, an empty text field, a card with fewer than three unities, or a missing image or description.

#### Scenario: Missing field caught
- **WHEN** a card's question is emptied and the checks are run
- **THEN** the checks fail and name the card

#### Scenario: Missing image caught
- **WHEN** a card's image file is removed and the checks are run
- **THEN** the checks fail and name the card
