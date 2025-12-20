# Issue 03: Timer Completion Alarm and Popup

## Problem Description

When a timer runs out (reaches 0:00), the application should:

1. **Play an alarm sound** to notify the user
2. **Display a popup message** indicating time is up
3. **Include a download button** in the popup to download the transcript

Currently, when `timeLeft === 0`, the timer simply stops without any notification.

## Root Cause Analysis

The timer completion logic in [FocusStream.jsx](file:///c:/Development/pomodoroApp/FocusStream.jsx#L24-L34):

```javascript
useEffect(() => {
  if (isActive && timeLeft > 0) {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
  } else if (timeLeft === 0) {
    setIsActive(false);
    clearInterval(timerRef.current);
    // Missing: alarm sound, popup notification
  }
  return () => clearInterval(timerRef.current);
}, [isActive, timeLeft]);
```

The `timeLeft === 0` branch only stops the timer but doesn't trigger any user notification.

## Proposed Changes

### [MODIFY] [FocusStream.jsx](file:///c:/Development/pomodoroApp/FocusStream.jsx)

#### 1. Add Popup State

Add new state for the completion popup (~line 19):

```javascript
// Completion Popup State
const [showCompletionPopup, setShowCompletionPopup] = useState(false);
const [completedMode, setCompletedMode] = useState(null);
```

#### 2. Add Audio Ref

Add a ref for the alarm audio (~line 21):

```javascript
const audioRef = useRef(null);
```

#### 3. Create Alarm Sound Function

Add a function to play a notification sound using the Web Audio API:

```javascript
const playAlarmSound = () => {
  // Create audio context for alarm
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  const playBeep = (startTime, frequency) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.5);
  };
  
  // Play a pleasant three-tone chime
  const now = audioContext.currentTime;
  playBeep(now, 523.25);        // C5
  playBeep(now + 0.2, 659.25);  // E5
  playBeep(now + 0.4, 783.99);  // G5
};
```

#### 4. Update Timer Effect

Modify the timer `useEffect` to trigger alarm and popup:

```diff
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(timerRef.current);
+     
+     // Only show popup if timer was actively counting down
+     if (timerRef.current) {
+       setCompletedMode(mode);
+       setShowCompletionPopup(true);
+       playAlarmSound();
+     }
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);
```

> **Note**: We check `timerRef.current` to ensure the popup only shows when the timer naturally completes, not on initial render when `timeLeft` might be 0.

#### 5. Add Close Popup Handler

Add a function to handle closing the popup:

```javascript
const handleCloseCompletionPopup = () => {
  setShowCompletionPopup(false);
  setCompletedMode(null);
};
```

#### 6. Add Completion Popup Component

Add the popup JSX after the toast notification (~after line 176):

```jsx
{/* Completion Popup */}
{showCompletionPopup && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div className={`bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-300 text-center ${
      completedMode === 'focus' ? 'ring-4 ring-rose-100' : 'ring-4 ring-emerald-100'
    }`}>
      {/* Icon */}
      <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
        completedMode === 'focus' 
          ? 'bg-gradient-to-br from-rose-100 to-orange-100' 
          : 'bg-gradient-to-br from-emerald-100 to-teal-100'
      }`}>
        {completedMode === 'focus' 
          ? <Brain size={40} className="text-rose-500" />
          : <Coffee size={40} className="text-emerald-500" />
        }
      </div>
      
      {/* Title */}
      <h2 className={`text-2xl font-bold mb-2 ${
        completedMode === 'focus' ? 'text-rose-600' : 'text-emerald-600'
      }`}>
        Time's Up!
      </h2>
      
      {/* Message */}
      <p className="text-slate-600 mb-6">
        {completedMode === 'focus' 
          ? 'Great focus session! Take a well-deserved break.' 
          : 'Break is over. Ready to focus again?'
        }
      </p>
      
      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => {
            exportLogs();
            handleCloseCompletionPopup();
          }}
          className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
        >
          <Download size={18} />
          Download Transcript
        </button>
        
        <button
          onClick={handleCloseCompletionPopup}
          className={`w-full py-3 text-white rounded-xl font-medium transition-colors active:scale-95 transform ${
            completedMode === 'focus'
              ? 'bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600'
              : 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600'
          }`}
        >
          Got it!
        </button>
      </div>
    </div>
  </div>
)}
```

## Summary of Changes

| Location | Change |
|----------|--------|
| State declarations (~line 19) | Add `showCompletionPopup` and `completedMode` state |
| Refs (~line 21) | Add `audioRef` for audio context |
| New function | Add `playAlarmSound()` function using Web Audio API |
| Timer useEffect (lines 24-34) | Add popup trigger and alarm when `timeLeft === 0` |
| New function | Add `handleCloseCompletionPopup()` handler |
| JSX (after toast) | Add completion popup modal |

## Visual Design

### Popup Modal

| Property | Value |
|----------|-------|
| Position | Fixed, centered with backdrop blur |
| Style | White card with colored ring based on mode |
| Icon | Brain (focus) or Coffee (break) with gradient background |
| Buttons | Download transcript + Dismiss |

### Alarm Sound

- **Type**: Web Audio API generated tones (no external files needed)
- **Pattern**: Pleasant three-tone ascending chime (C5 → E5 → G5)
- **Duration**: ~0.6 seconds total
- **Volume**: 30% to avoid being too startling

## Verification Plan

### Manual Testing

1. **Focus Timer Completion**
   - Set focus timer to 1 minute (for quick testing)
   - Start the timer and let it count to 0
   - ✓ Alarm sound plays
   - ✓ Popup appears with "Time's Up!" message
   - ✓ Message says "Great focus session!"
   - ✓ Download button is visible

2. **Break Timer Completion**
   - Switch to break mode
   - Set break timer to 1 minute
   - Let it complete
   - ✓ Alarm sound plays
   - ✓ Popup appears with break-specific styling
   - ✓ Message says "Break is over"

3. **Download from Popup**
   - Add some entries to the log
   - Let timer complete
   - Click "Download Transcript" button
   - ✓ Text file downloads with all entries
   - ✓ Popup closes after download

4. **Dismiss Popup**
   - Let timer complete
   - Click "Got it!" button
   - ✓ Popup closes
   - ✓ Timer stays at 0:00

### Edge Cases

- Timer completion with empty session log
- Rapid timer resets after completion
- Multiple alarms don't stack (shouldn't be possible, but verify)
- Audio works on different browsers (Chrome, Firefox, Safari)

## Browser Compatibility

The Web Audio API is supported in all modern browsers:
- Chrome 35+
- Firefox 25+
- Safari 6.1+
- Edge 12+

## Dependencies

None - uses native Web Audio API (no external sound files).

## Estimated Effort

**Medium** - Multiple state additions, Web Audio implementation, and modal component, ~45 minutes implementation + testing
