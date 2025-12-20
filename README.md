# FocusStream

**FocusStream** is a beautifully designed Pomodoro timer application that helps you maintain focus and productivity through structured work sessions. Built with React and featuring a modern, dark-mode interface with smooth animations and glassmorphism effects, FocusStream combines aesthetic appeal with powerful functionality.

![FocusStream Focus Mode](C:/Users/nicka_qw9tenq/.gemini/antigravity/brain/52184e27-b2a7-4112-bf1c-fa0b4258afb8/initial_focus_mode_1766245682269.png)

## Features

- **Focus & Break Modes**: Alternate between focused work sessions (25 minutes) and refreshing breaks (5 minutes)
- **Customizable Timers**: Adjust focus and break durations to match your workflow
- **Session Logging**: Document your thoughts, progress, and accomplishments during each session
- **Export Functionality**: Download your session logs as timestamped text files for future reference
- **Audio Notifications**: Get audible alerts when your timer completes using Web Audio API
- **Premium Design**: 
  - Modern glassmorphism effects
  - Smooth micro-animations
  - Color-coded modes (purple for focus, green for breaks)
  - Responsive layout that works on all devices
- ** Smart Safety Features**: 
  - Timer lock prevents accidental mode switching during active sessions
  - Confirmation popup when timer completes with session summary

---

## Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Clone or download the repository**:
   ```bash
   git clone <repository-url>
   cd pomodoroApp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:5173
   ```

---

### Starting a Focus Session

1. **Select Mode**: Choose between "Focus" (default 25 min) or "Break" (default 5 min)
2. **Start Timer**: Click the Play button to begin your session
3. **Log Your Work**: Use the input field at the bottom to add notes during your session
4. **Stay Focused**: The timer will run until completion, with buttons locked to prevent accidents

![Session with Logs](C:/Users/nicka_qw9tenq/.gemini/antigravity/brain/52184e27-b2a7-4112-bf1c-fa0b4258afb8/log_entry_visible_1766245737686.png)

### Break Time

Switch to **Break Mode** for shorter, refreshing intervals. The interface changes to a calming green theme to help you relax.

![Break Mode](C:/Users/nicka_qw9tenq/.gemini/antigravity/brain/52184e27-b2a7-4112-bf1c-fa0b4258afb8/break_mode_active_1766245757131.png)

### Customizing Timer Durations

Click the ⚙️ **Settings** icon in the header to customize your focus and break durations. Changes are saved to localStorage and persist across sessions.

![Settings Modal](C:/Users/nicka_qw9tenq/.gemini/antigravity/brain/52184e27-b2a7-4112-bf1c-fa0b4258afb8/settings_modal_open_1766245769781.png)

---

### Key Files

#### `App.jsx`
The heart of FocusStream, containing:
- **State Management**: Timer state, mode switching, settings, and session logs
- **Timer Logic**: Countdown mechanism with useEffect hooks
- **Audio System**: Web Audio API implementation for completion alerts
- **UI Components**: All interface elements including modals, controls, and animations
- **Data Export**: Session log download functionality using the file-saver library

#### `index.css`
Minimal global styles that import Tailwind CSS utilities. All styling is done through Tailwind classes in the JSX.

#### `main.jsx`
React application entry point that mounts the App component to the DOM.

---

## 🛠️ Technology Stack

- **[React](https://react.dev/)** (v18.3.1) - UI framework
- **[Vite](https://vitejs.dev/)** (v6.0.6) - build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** (v3.4.17) - CSS framework
- **[Lucide React](https://lucide.dev/)** (v0.468.0) - icon library
- **[FileSaver.js](https://github.com/eligrey/FileSaver.js/)** (v2.0.5) - Client-side file downloads

## Features

### Timer Safety Lock
When a timer is active, mode-switching buttons are automatically disabled to prevent accidental resets. This ensures you won't lose your current session progress.

### Completion Popup
When your timer finishes:
- An audio alarm plays (three gentle beeps)
- A modal appears with session statistics
- Options to download the session log or dismiss

### Local Storage
Settings and preferences are automatically saved to browser localStorage, so your customizations persist between sessions.

### Web Audio API
Instead of relying on audio files, FocusStream generates alert sounds programmatically using the Web Audio API, ensuring sounds work anywhere without external dependencies.

---

## Session Log Format

When you export your session log, it's saved as a `.txt` file with this format:

```
FocusStream Session Log
Exported: 2025-12-20 at 09:45:23
Mode: Focus

=== SESSION ENTRIES ===

[09:30:15] Starting work on project documentation
[09:35:42] Completed introduction section
[09:40:18] Working on feature list

=== END OF LOG ===
```

---

## License

This project is open source and available for personal and educational use.

---