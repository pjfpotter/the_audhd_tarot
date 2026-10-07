# Spec Delta

## Purpose

Defines The AuDHD Tarot as an application: its name and landing screen, its static and private operation on the person's own device, its two themes, and its layout from phone to desktop.

## ADDED Requirements

### Requirement: The app is named The AuDHD Tarot
The app SHALL present itself as "The AuDHD Tarot" in its landing screen, page title and metadata. The former name "Neurospicy Tarot" and the domain `neurospicytarot.app` SHALL NOT appear anywhere in the app.

#### Scenario: Name shown
- **WHEN** the app is opened
- **THEN** the landing screen and the browser tab title both read "The AuDHD Tarot"

#### Scenario: Old name absent
- **WHEN** the built app is searched for "neurospicy"
- **THEN** there are no matches

### Requirement: A landing screen introduces the app and leads to a reading
The app SHALL open on a landing screen that names the app, says in a sentence or two who it is for and what it offers, and provides one clearly primary control that leads to drawing a reading.

#### Scenario: Enter
- **WHEN** a person activates the primary control on the landing screen
- **THEN** they arrive at the draw

### Requirement: The app runs entirely on the person's device
The app SHALL work as static files with no server-side processing, no account, and no AI service. After the app has loaded it SHALL make no network requests other than for its own files, and it SHALL NOT send any information about the person or their readings anywhere.

#### Scenario: No third-party requests
- **WHEN** a person loads the app and completes a reading while network activity is recorded
- **THEN** every request is to the app's own origin

#### Scenario: Nothing collected
- **WHEN** a person completes a reading
- **THEN** no request carries their cards, choices or any identifier, and the app sets no cookies

### Requirement: The app has a light theme and a dark theme
The app SHALL provide a light theme and a dark theme that share one visual vocabulary of black, white and a violet-to-lavender accent family. Every screen SHALL be complete and legible in both.

#### Scenario: Both themes complete
- **WHEN** each screen is viewed in the light theme and then the dark theme
- **THEN** all content and controls are present and legible in both

### Requirement: The layout works from small phones to wide desktops
The app SHALL be designed for phones first and SHALL be usable at viewport widths from 320 CSS pixels upward without horizontal scrolling. On wide viewports the layout SHALL make use of the available width, and the full reading SHALL show its three cards side by side.

#### Scenario: Small phone
- **WHEN** the app is used at a 320px-wide viewport
- **THEN** every screen fits the width with no horizontal scrolling

#### Scenario: Desktop reading
- **WHEN** the full reading is viewed at a 1280px-wide viewport
- **THEN** the three cards are shown side by side and the content is not confined to a phone-width column

#### Scenario: Readable line length on desktop
- **WHEN** reading text is viewed at any viewport width
- **THEN** no line of reading text exceeds about 75 characters

### Requirement: The app is fast to load on a phone
The app's first screen SHALL be usable without waiting for card images, and a card's image SHALL be loaded by the time that card can be revealed.

#### Scenario: First screen without images
- **WHEN** the app is opened on a slow connection
- **THEN** the landing screen is usable before any card image has finished loading

#### Scenario: No blank reveal
- **WHEN** a person reveals a card
- **THEN** its image is shown immediately, without a blank or partially loaded image
