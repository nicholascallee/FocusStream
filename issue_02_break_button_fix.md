# Issue 02: Break Button Timer Switch Prevention

## Problem Description

When the timer is running, clicking the **Break** button (or Focus button when in break mode) currently:
- Switches the user to the break timer
- Resets the timer to the break duration

**Expected behavior**: The app should prevent the user from switching modes while the timer is running to avoid accidental resets.

## Root Cause Analysis

The issue is that the mode switching buttons are always interactive, and the `switchMode` function presently allows switching regardless of the timer state.

## Selected Solution: Disable Buttons

Instead of showing an error message (Toast) after a click, we will **visually disable** the mode buttons when the timer is active. This provides immediate visual feedback that switching is not possible without stopping the timer first.

### Changes

#### [MODIFY] [FocusStream.jsx](file:///c:/Development/pomodoroApp/FocusStream.jsx)

1.  **Update Mode Buttons**:
    - Add `disabled={isActive}` prop to both Focus and Break buttons.
    - Add conditional styling to reduce opacity and show `cursor-not-allowed` when `isActive` is true.

2.  **Update switchMode Function (Safety Guard)**:
    - Add a guard clause to preventing switching if `isActive` is true (as a backup safety measure).

## Verification Plan

### Manual Testing

1.  **Timer Running - Buttons Disabled**
    - Start the focus timer.
    - Observe that "Focus" and "Break" buttons appear dimmed/disabled.
    - Click "Break" button.
    - ✓ **Result**: Nothing happens. Timer continues running.

2.  **Timer Stopped - Buttons Enabled**
    - Pause or Reset the timer.
    - Observe that buttons appear normal (fully opaque).
    - Click "Break" button.
    - ✓ **Result**: Mode switches to Break.

3.  **Visual Check**
    - Verify that the disabled state looks intentional (e.g., lower opacity) and not broken.
