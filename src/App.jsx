import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Download, Trash2, Send, Coffee, Brain, Settings, X } from 'lucide-react';
import { saveAs } from 'file-saver';

const FocusStream = () => {
  // Configuration State
  const [config, setConfig] = useState({
    focus: 25,
    break: 5
  });
  const [showSettings, setShowSettings] = useState(false);

  // Timer State
  const [mode, setMode] = useState('focus'); // 'focus' or 'break'
  const [timeLeft, setTimeLeft] = useState(config.focus * 60);
  const [isActive, setIsActive] = useState(false);

  // Data State
  const [entries, setEntries] = useState([]);
  const [inputText, setInputText] = useState('');

  // Completion Popup State
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [completedMode, setCompletedMode] = useState(null);

  const timerRef = useRef(null);
  const isActiveRef = useRef(isActive);
  const timerStartedRef = useRef(false);

  // Keep ref in sync
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Play alarm sound using Web Audio API
  const playAlarmSound = () => {
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

    // Play a pleasant three-tone chime (C5 -> E5 -> G5)
    const now = audioContext.currentTime;
    playBeep(now, 523.25);
    playBeep(now + 0.2, 659.25);
    playBeep(now + 0.4, 783.99);
  };

  // Timer Logic
  useEffect(() => {
    let intervalId = null;

    if (isActive && timeLeft > 0) {
      timerStartedRef.current = true;
      intervalId = setInterval(() => {
        setTimeLeft((prev) => {
          const next = prev - 1;
          if (next === 0) {
            // Timer completed - use setTimeout to escape React's batch
            setTimeout(() => {
              setIsActive(false);
              setCompletedMode(mode);
              setShowCompletionPopup(true);
              playAlarmSound();
              timerStartedRef.current = false;
            }, 0);
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, mode]);

  // Handlers
  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(config[mode] * 60);
  };

  const handleCloseCompletionPopup = () => {
    setShowCompletionPopup(false);
    setCompletedMode(null);
  };

  const switchMode = (newMode) => {
    // Prevent switching if timer is currently running (check Ref for latest truth)
    if (isActiveRef.current) return;

    // Only switch if same mode isn't already selected
    if (mode === newMode) return;

    setMode(newMode);
    setTimeLeft(config[newMode] * 60);
  };

  const saveSettings = (newFocus, newBreak) => {
    const focusVal = parseInt(newFocus) || 25;
    const breakVal = parseInt(newBreak) || 5;

    setConfig({ focus: focusVal, break: breakVal });
    setShowSettings(false);

    // If timer is not running, update the display immediately
    if (!isActive) {
      setTimeLeft((mode === 'focus' ? focusVal : breakVal) * 60);
    }
  };

  const handleInputChange = (e) => setInputText(e.target.value);

  const handleInputSubmit = (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && inputText.trim()) {
      e.preventDefault();
      const now = new Date();
      const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      const newEntry = {
        id: Date.now(),
        text: inputText,
        time: timestamp,
        sessionType: mode
      };

      setEntries([newEntry, ...entries]);
      setInputText('');
    }
  };

  const clearEntries = () => {
    if (window.confirm('Are you sure you want to clear your session logs?')) {
      setEntries([]);
    }
  };

  const exportLogs = React.useCallback(() => {
    console.log('[DEBUG] exportLogs called');
    const now = new Date();
    const dateStr = now.toLocaleDateString();

    let fileContent = `FocusStream Session Log - ${dateStr}\n`;
    fileContent += `=====================================\n\n`;

    if (entries.length === 0) {
      fileContent += "(No entries recorded yet)\n";
    } else {
      [...entries].reverse().forEach(entry => {
        fileContent += `[${entry.time}] (${entry.sessionType.toUpperCase()}) ${entry.text}\n`;
      });
    }

    const filename = `focus-stream-log-${now.toISOString().split('T')[0]}.txt`;
    console.log(`[DEBUG] Preparing file: ${filename}`);

    // Create a Blob with explicit text/plain type and BOM for better recognition
    const BOM = '\uFEFF';  // UTF-8 BOM helps some programs identify the file
    const blob = new Blob([BOM + fileContent], { type: 'text/plain;charset=utf-8' });

    // Use msSaveBlob for IE/Edge if available
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, filename);
      console.log('[DEBUG] Download via msSaveBlob');
      return;
    }

    // Standard approach with longer delay before cleanup
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Set download attribute BEFORE href (order matters in some browsers)
    link.download = filename;
    link.href = url;

    // Make link part of document flow 
    link.style.position = 'absolute';
    link.style.left = '-9999px';
    link.textContent = 'Download';  // Some browsers need content
    document.body.appendChild(link);

    // Small delay to ensure DOM is ready
    requestAnimationFrame(() => {
      link.click();

      // Much longer cleanup delay - Chrome needs time to start download
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('[DEBUG] Cleanup complete');
      }, 5000);
    });

    console.log('[DEBUG] Download initiated');
  }, [entries]);

  // Formatting & Progress
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTotalTime = config[mode] * 60;
  const progress = ((currentTotalTime - timeLeft) / currentTotalTime) * 100;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-rose-100 selection:text-rose-900 transition-colors duration-500 relative">

      {/* Completion Popup */}
      {showCompletionPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-300 text-center ${completedMode === 'focus' ? 'ring-4 ring-rose-100' : 'ring-4 ring-emerald-100'
            }`}>
            {/* Icon */}
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${completedMode === 'focus'
              ? 'bg-gradient-to-br from-rose-100 to-orange-100'
              : 'bg-gradient-to-br from-emerald-100 to-teal-100'
              }`}>
              {completedMode === 'focus'
                ? <Brain size={40} className="text-rose-500" />
                : <Coffee size={40} className="text-emerald-500" />
              }
            </div>

            {/* Title */}
            <h2 className={`text-2xl font-bold mb-2 ${completedMode === 'focus' ? 'text-rose-600' : 'text-emerald-600'
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
                  // Delay popup close to ensure download properly initiates
                  setTimeout(handleCloseCompletionPopup, 300);
                }}
                className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download Transcript
              </button>

              <button
                onClick={handleCloseCompletionPopup}
                className={`w-full py-3 text-white rounded-xl font-medium transition-colors active:scale-95 transform ${completedMode === 'focus'
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

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-700">Timer Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              saveSettings(e.target.focus.value, e.target.break.value);
            }}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-2">Focus Duration (minutes)</label>
                  <input
                    name="focus"
                    type="number"
                    defaultValue={config.focus}
                    min="1"
                    max="180"
                    className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 ring-rose-500/20 outline-none font-mono text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-2">Break Duration (minutes)</label>
                  <input
                    name="break"
                    type="number"
                    defaultValue={config.break}
                    min="1"
                    max="60"
                    className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 ring-emerald-500/20 outline-none font-mono text-lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-900 transition-colors active:scale-95 transform"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="p-4 md:p-6 flex justify-between items-center max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-orange-500 tracking-tight">
          FocusStream <span className="text-xs text-red-500 block">DEBUG APP v4</span>
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full text-slate-600 hover:bg-slate-200 transition-colors"
            title="Settings"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={exportLogs}
            className="p-2 rounded-full text-slate-600 hover:bg-slate-200 transition-colors"
            title="Export Logs"
          >
            <Download size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 flex flex-col gap-6">
        <div className="bg-yellow-100 p-2 text-xs font-mono border border-yellow-300 rounded text-center">
          DEBUG: isActive={isActive.toString()} | Mode={mode} | Time={timeLeft}
        </div>

        {/* Timer Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 flex flex-col items-center relative overflow-hidden">
          {/* Progress Bar Top */}
          <div className="absolute top-0 left-0 h-1 bg-slate-100 w-full">
            <div
              className={`h-full transition-all duration-1000 ${mode === 'focus' ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Mode Toggles */}
          <div className="flex bg-slate-100 p-1 rounded-full mb-8">
            <button
              onClick={() => switchMode('focus')}
              disabled={isActive}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${mode === 'focus' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                } ${isActive ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
            >
              <div className="flex items-center gap-2">
                <Brain size={16} /> Focus
              </div>
            </button>
            <button
              onClick={() => switchMode('break')}
              disabled={isActive}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${mode === 'break' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                } ${isActive ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
            >
              <div className="flex items-center gap-2">
                <Coffee size={16} /> Break
              </div>
            </button>
          </div>

          {/* Timer Display */}
          <div className={`text-8xl font-black tracking-tighter tabular-nums mb-8 ${mode === 'focus' ? 'text-slate-800' : 'text-emerald-700'}`}>
            {formatTime(timeLeft)}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTimer}
              className={`h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-lg transform active:scale-95 transition-all hover:shadow-xl ${mode === 'focus'
                ? 'bg-gradient-to-br from-rose-500 to-orange-500 shadow-rose-200'
                : 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-200'
                }`}
            >
              {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
            </button>

            <button
              onClick={resetTimer}
              className="h-16 w-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <RotateCcw size={24} />
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="relative">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleInputSubmit}
            placeholder="Type thought & hit enter..."
            className="w-full bg-white border-none shadow-lg shadow-slate-200/50 rounded-2xl py-5 pl-6 pr-14 text-lg outline-none focus:ring-2 ring-rose-500/20 transition-all placeholder:text-slate-400"
          />
          <button
            onClick={handleInputSubmit}
            className="absolute right-3 top-3 p-2 bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
          >
            <Send size={20} />
          </button>
        </div>

        {/* Log Stream */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Session Log</h2>
            {entries.length > 0 && (
              <button
                onClick={clearEntries}
                className="text-xs text-rose-400 hover:text-rose-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
              >
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>

          <div className="space-y-3 pb-8">
            {entries.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                <p>Start the timer and log your distractions here.</p>
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4 items-start animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                  <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-md whitespace-nowrap">
                    {entry.time}
                  </span>
                  <p className="text-slate-700 leading-snug">{entry.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FocusStream;