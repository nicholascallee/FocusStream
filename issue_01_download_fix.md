# Issue 01: Download Blob File Bug

## Problem Description

When the timer is running, clicking the download button downloads a **blob file** instead of a properly formatted **text file** (`.txt`). The download should always produce a text file containing whatever is currently written in the session log.

## Root Cause Analysis

After reviewing the [exportLogs](file:///c:/Development/pomodoroApp/FocusStream.jsx#89-114) function in [FocusStream.jsx](file:///c:/Development/pomodoroApp/FocusStream.jsx#L89-L113):

```javascript
const exportLogs = () => {
  const dateStr = new Date().toLocaleDateString();
  let fileContent = `FocusStream Session Log - ${dateStr}\n`;
  fileContent += `=====================================\n\n`;

  if (entries.length === 0) {
    fileContent += "(No entries recorded yet)\n";
  } else {
    [...entries].reverse().forEach(entry => {
      fileContent += `[${entry.time}] (${entry.sessionType.toUpperCase()}) ${entry.text}\n`;
    });
  }

  const blob = new Blob([fileContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `focus-stream-log-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
```

The current code appears correct—it creates a `Blob` with `type: 'text/plain'` and sets the download filename with `.txt` extension. However, the issue may be:

1. **Browser behavior during active state**: Some browsers may handle blob downloads differently when JavaScript is actively running timers
2. **Missing charset specification**: The MIME type could benefit from explicit UTF-8 encoding
3. **Timing issue**: The blob URL might be revoked before the download completes

## Proposed Changes

### [MODIFY] [FocusStream.jsx](file:///c:/Development/pomodoroApp/FocusStream.jsx)

Update the [exportLogs](file:///c:/Development/pomodoroApp/FocusStream.jsx#89-114) function with the following improvements:

```diff
  const exportLogs = () => {
-   const dateStr = new Date().toLocaleDateString();
+   const now = new Date();
+   const dateStr = now.toLocaleDateString();
+   const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
+   
    let fileContent = `FocusStream Session Log - ${dateStr}\n`;
    fileContent += `=====================================\n\n`;

    if (entries.length === 0) {
      fileContent += "(No entries recorded yet)\n";
    } else {
      [...entries].reverse().forEach(entry => {
        fileContent += `[${entry.time}] (${entry.sessionType.toUpperCase()}) ${entry.text}\n`;
      });
    }

-   const blob = new Blob([fileContent], { type: 'text/plain' });
+   const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
-   a.download = `focus-stream-log-${Date.now()}.txt`;
+   // Use readable date format for filename
+   const filename = `focus-stream-log-${now.toISOString().split('T')[0]}.txt`;
+   a.download = filename;
+   a.style.display = 'none';
    document.body.appendChild(a);
+   a.click();
+
-   a.click();
-   document.body.removeChild(a);
-   URL.revokeObjectURL(url);
+   // Use setTimeout to ensure cleanup happens after download starts
+   setTimeout(() => {
+     document.body.removeChild(a);
+     URL.revokeObjectURL(url);
+   }, 100);
  };
```

### Key Changes

| Change | Reason |
|--------|--------|
| Add `charset=utf-8` to MIME type | Ensures proper text encoding across all browsers |
| Synchronous `click()` | Ensures browser treats this as a user-initiated action (prevents popup blocking) |
| Asynchronous Cleanup | Prevents race condition where URL is revoked before download initiates |
| Add `a.style.display = 'none'` | Prevents flash of anchor element |
| Use ISO date format for filename | Creates more readable, sortable filenames |

## Verification Plan

### Manual Testing

1. Start the focus timer and let it run
2. Add several entries to the session log
3. Click the download button while timer is still running
4. Verify downloaded file:
   - Has `.txt` extension
   - Opens in text editor
   - Contains all session log entries
   - Is properly formatted with timestamps

### Edge Cases to Test

- Download with empty session log (timer running)
- Download with entries (timer running)
- Download with empty session log (timer paused)
- Download with entries (timer paused)
- Download during break mode

## Dependencies

None - this is a self-contained fix within the existing component.

## Estimated Effort

**Low** - Single function modification, ~15 minutes implementation + testing
