# Spec Delta

## MODIFIED Requirements

### Requirement: Nothing flashes, plays or moves on its own
The app SHALL contain no flashing or strobing content and no sound. No content SHALL move or animate continuously without the person's action, with one exception: the shuffle's cloud of cards may drift gently, provided that it is never shown when reduced motion is in effect, that a visible control holds it still with one activation, and that it stops when the app is not in view.

#### Scenario: Idle screen is still
- **WHEN** any screen other than the shuffle's cloud is left idle after its entrance has finished
- **THEN** nothing on it is moving, blinking or playing sound

#### Scenario: The cloud can be held still
- **WHEN** the shuffle's cloud is drifting and a person activates the hold-still control
- **THEN** nothing on the screen is moving

#### Scenario: No cloud under reduced motion
- **WHEN** reduced motion is in effect and a person reaches the shuffle
- **THEN** nothing on the screen moves without their action

#### Scenario: Stops out of view
- **WHEN** the app's tab is hidden or the phone's screen is off
- **THEN** the cloud is not animating

## ADDED Requirements

### Requirement: Moving the device is never required
Anything a person can do by tilting or moving their device SHALL also be possible without doing so, and the app SHALL respond to device movement only after the person has asked it to. The person SHALL be able to stop the app responding to movement.

#### Scenario: Complete without movement
- **WHEN** a person uses the app on a device fixed in place, such as a phone in a mount
- **THEN** they can shuffle, draw and read without moving it

#### Scenario: Turn movement off
- **WHEN** a person has let the app respond to movement and then turns it off
- **THEN** moving the device has no further effect
