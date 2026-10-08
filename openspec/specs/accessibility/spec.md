# accessibility Specification

## Purpose

Makes The AuDHD Tarot usable by people with the sensory, motor, visual and cognitive differences common among its audience, through options a person can set and a baseline every screen must meet.

## Requirements

### Requirement: Accessibility options are reachable from every screen
The app SHALL provide an accessibility options panel that can be opened from every screen with one activation, and closed again returning the person to where they were with nothing lost.

#### Scenario: Open during a reading
- **WHEN** a person opens the options panel while a card's reading text is shown and then closes it
- **THEN** they return to the same card with the same reading intact

#### Scenario: Keyboard access
- **WHEN** a keyboard user opens the options panel
- **THEN** focus moves into the panel, stays within it while it is open, Escape closes it, and focus returns to the control that opened it

### Requirement: A person can choose the theme
The options SHALL offer a theme choice of "Match my device", "Light" and "Dark". "Match my device" SHALL be the default and SHALL follow the device's light or dark setting.

#### Scenario: Default follows device
- **WHEN** a person with a device set to dark opens the app for the first time
- **THEN** the dark theme is shown

#### Scenario: Explicit choice wins
- **WHEN** a person with a device set to dark chooses "Light"
- **THEN** the light theme is shown immediately

### Requirement: A person can reduce motion
The options SHALL offer a motion choice of "Match my device" and "Reduced". "Match my device" SHALL be the default and SHALL honour the device's reduced-motion setting. With reduced motion in effect, the app SHALL show no movement, scaling, parallax or looping animation; changes of state SHALL be instant or a brief fade.

#### Scenario: Device setting honoured
- **WHEN** a person whose device requests reduced motion uses the app without changing any option
- **THEN** no element moves, scales or loops anywhere in the app

#### Scenario: Reduced chosen in the app
- **WHEN** a person whose device does not request reduced motion chooses "Reduced"
- **THEN** reduced motion takes effect immediately across the app

### Requirement: A person can change the text size
The options SHALL offer at least four text sizes, from the default up to at least 150% of the default. The choice SHALL scale all reading text, and at every size no text SHALL be cut off, overlap, or require scrolling sideways.

#### Scenario: Largest size on a small phone
- **WHEN** a person chooses the largest text size on a 320px-wide viewport
- **THEN** all reading text is larger, fully visible and readable by scrolling vertically only

### Requirement: Options are remembered on the device
The person's theme, motion and text size choices SHALL be kept on their device and applied the next time they open the app, before the first screen is shown. If choices cannot be stored, the app SHALL still work and apply them for the current visit.

#### Scenario: Choice persists
- **WHEN** a person chooses "Dark" and the largest text size, closes the app and opens it again
- **THEN** the app opens in the dark theme at the largest text size, with no flash of another theme

#### Scenario: Storage unavailable
- **WHEN** the device blocks storage and the person chooses "Dark"
- **THEN** the dark theme applies for that visit and no error is shown

### Requirement: Everything works by keyboard and switch
Every action in the app SHALL be performable with a keyboard alone, in an order that follows the visual order, with a clearly visible focus indicator on the focused control in both themes.

#### Scenario: Complete a reading by keyboard
- **WHEN** a person uses only Tab, Shift+Tab, Enter, Space and Escape
- **THEN** they can enter, draw, reveal all three cards, read the full reading and start again

#### Scenario: Focus visible
- **WHEN** any control receives keyboard focus in either theme
- **THEN** a focus indicator is visible with at least 3:1 contrast against its surroundings

### Requirement: Screen readers receive the full experience
All content and state changes SHALL be available to screen readers: every control has an accessible name, every card image has its written description, screens have headings in a logical order, and a change of screen or a card reveal is announced. Decorative elements SHALL be hidden from screen readers.

#### Scenario: Controls named
- **WHEN** a screen-reader user moves through any screen
- **THEN** every control announces a name that says what it does

#### Scenario: Decoration hidden
- **WHEN** a screen-reader user moves through any screen
- **THEN** ornamental marks, borders and background imagery are not announced

### Requirement: Text is readable
Reading text SHALL be real text, not text in images, set in Atkinson Hyperlegible at no less than 16 CSS pixels at the default size, with no text anywhere in the app smaller than 14 CSS pixels. Text and meaningful graphics SHALL meet WCAG 2.2 AA contrast in both themes. Blackletter or other decorative type SHALL NOT be used for reading text.

#### Scenario: Minimum sizes
- **WHEN** any screen is inspected at the default text size
- **THEN** essence, question and unity text is at least 16 CSS pixels and no visible text is under 14 CSS pixels

#### Scenario: Contrast in both themes
- **WHEN** each screen is checked in the light theme and the dark theme
- **THEN** all text has a contrast ratio of at least 4.5:1, or 3:1 for large text

### Requirement: Controls are easy to hit and never timed
Every interactive control SHALL have a target of at least 44 by 44 CSS pixels. No action SHALL depend on a time limit, and information SHALL never be conveyed by colour alone.

#### Scenario: Target size
- **WHEN** any control on any screen is measured
- **THEN** its target is at least 44 by 44 CSS pixels

#### Scenario: No time limits
- **WHEN** a person leaves any screen untouched for ten minutes
- **THEN** nothing has been lost or dismissed and they can continue where they were

### Requirement: Nothing flashes, plays or moves on its own
The app SHALL contain no flashing or strobing content, no sound, and no content that moves or animates continuously without the person's action.

#### Scenario: Idle screen is still
- **WHEN** any screen is left idle after its entrance has finished
- **THEN** nothing on it is moving, blinking or playing sound
