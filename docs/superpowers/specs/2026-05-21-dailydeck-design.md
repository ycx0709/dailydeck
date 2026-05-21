# DailyDeck Design

Date: 2026-05-21
Status: Approved for implementation planning

## Summary

DailyDeck is a Windows desktop companion app for daily computer use. It combines lightweight performance visibility, simple daily notes and tasks, and clipboard history in a compact always-available window.

The first version focuses on practical daily use rather than professional observability. It should answer three questions quickly:

- Is my computer under load?
- What should I do or remember today?
- What did I copy recently?

## Target Platform

- Operating system: Windows
- App shape: small persistent desktop window with system tray support
- Technology direction: Electron + React
- Data storage: local-first storage, initially JSON or SQLite depending on implementation fit

Electron + React is the preferred first implementation because it gives reliable access to Windows desktop capabilities such as clipboard access, tray menu, notifications, and local persistence while keeping the UI easy to iterate.

## Product Scope

### In Scope

- Compact desktop dashboard
- CPU, memory, disk, and network summary
- High CPU or memory process list
- Today tasks
- Quick notes
- Text clipboard history
- Clipboard item pinning
- Clipboard item deletion and clearing
- Pause or resume clipboard recording
- System tray menu
- Local-only persistence

### Out of Scope for Version 1

- Pomodoro timer
- Application or website launcher
- Cloud sync
- Account login
- Ending processes from the app
- Advanced charts or historical system metrics
- Non-text clipboard capture such as images and files
- Mobile support

## User Experience

DailyDeck opens as a compact warm-toned utility window. The first screen is the actual working dashboard, not a landing page.

The window should feel calm, useful, and dense enough for repeated daily use. It should avoid decorative hero sections, marketing copy, and large empty panels. The user should be able to glance at the top row for system status, add a note or task in the left work area, and retrieve clipboard entries from the right area.

Suggested layout:

- Header: app name, current status summary, pause clipboard toggle, window controls
- Top metrics row: CPU, memory, disk, network
- Main left column: today tasks and quick notes
- Main right column: clipboard history
- Bottom or collapsible area: high-usage process list and health notices

The app can start as a single-window experience. Tray controls provide fast access without forcing the app to stay visible.

## Visual Direction

The UI should be inspired by Claude's warm editorial design language, adapted for a desktop productivity tool.

### Color

- Canvas: warm paper background, around `#faf9f5` or `#f5f4ed`
- Primary accent: muted coral, around `#cc785c`
- Text: deep ink or navy-black
- Secondary text: warm gray
- Utility surfaces: light cream cards
- Performance detail surfaces: restrained dark panels for contrast

The palette should not become a monochrome beige interface. Coral should be used sparingly for primary actions, active states, and important status accents.

### Typography

- Use system-safe fonts for implementation reliability.
- Prefer a humanist sans feel for body text.
- Use modest heading sizes because this is a compact utility, not a marketing page.
- Do not scale typography directly with viewport width.

### Shape and Spacing

- Use an 8px radius for most controls and cards.
- Use stable dimensions for metric tiles, clipboard rows, and task controls to prevent layout shift.
- Use tight, readable spacing based on a 4px or 8px rhythm.
- Avoid nested cards and decorative floating sections.

## Feature Design

### Performance Overview

The top row displays:

- CPU usage percentage
- Memory usage percentage and used/total memory
- Disk usage or disk activity summary
- Network send/receive rate

Each metric should have a clear label, numeric value, and simple status treatment. The first version can use text and small bars rather than complex charts.

Refresh interval should be frequent enough to feel live, but not so frequent that the app itself becomes noisy. A one-second or two-second polling interval is acceptable for the first version.

### High-Usage Processes

The process list shows the current top consumers by CPU or memory. Each row includes:

- Process name
- CPU usage if available
- Memory usage

Version 1 is read-only. It should not include a kill-process button because accidental termination is too risky for the first release.

### Today Tasks

The task area supports:

- Add a task
- Mark complete or incomplete
- Delete a task
- Persist tasks locally

Tasks are intentionally simple. Version 1 does not need projects, due dates, reminders, tags, recurrence, or search.

### Quick Notes

The quick note area supports:

- Fast text entry
- Save note
- Delete note
- Persist notes locally

Notes are for short daily capture, not long-form writing. The interface should bias toward quick input and scanning.

### Clipboard History

Clipboard history records text copied by the user.

Behavior:

- Default mode records all text clipboard entries.
- Duplicate consecutive entries should not create repeated rows.
- Each item shows a short preview and timestamp.
- User can copy an item back to the clipboard.
- User can pin an item.
- User can delete an item.
- User can clear all unpinned items or clear all items.
- User can pause and resume clipboard recording.

Security note:

The selected behavior intentionally records all text, including potentially sensitive text. The UI should still provide visible controls for pause, clear, and delete because they are useful safeguards.

### Tray Menu

The system tray menu includes:

- Show or hide DailyDeck
- Pause or resume clipboard recording
- Clear clipboard history
- Quit

The tray icon should keep the app available without requiring the main window to remain visible.

## Data Model

Suggested local data types:

```ts
type Task = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

type Note = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
};

type ClipboardItem = {
  id: string;
  text: string;
  pinned: boolean;
  createdAt: string;
  lastCopiedAt: string;
};

type AppSettings = {
  clipboardRecordingEnabled: boolean;
  clipboardMaxItems: number;
  launchAtLogin: boolean;
};
```

The first implementation can store data locally in an app data directory. If using JSON, writes should be atomic enough to avoid corrupting data on app exit. If using SQLite, schema migration can stay minimal for version 1.

## Architecture

### Electron Main Process

Responsibilities:

- Create and manage the application window
- Create the tray icon and menu
- Read clipboard text on an interval or through a platform-appropriate mechanism
- Collect system metrics and process information
- Manage local persistence
- Expose safe IPC handlers to the renderer

### React Renderer

Responsibilities:

- Render the dashboard
- Manage UI state for tasks, notes, clipboard list, metrics, and settings
- Call IPC APIs for persistent changes and system actions
- Keep controls responsive and predictable

### IPC Boundary

The renderer should not directly access Node APIs. It should call a small typed preload API for:

- `getSystemSnapshot`
- `getTasks`
- `createTask`
- `updateTask`
- `deleteTask`
- `getNotes`
- `createNote`
- `deleteNote`
- `getClipboardItems`
- `copyClipboardItem`
- `deleteClipboardItem`
- `clearClipboardItems`
- `setClipboardRecordingEnabled`
- `getSettings`
- `updateSettings`

This keeps desktop capabilities centralized in the main process and reduces accidental security exposure.

## Error Handling

- If system metrics fail, show an unavailable state for that metric instead of crashing.
- If process metrics fail, hide the process list error behind a compact message.
- If persistence fails, show a small error notice and keep in-memory state until retry or restart.
- If clipboard access fails, show a paused/error state in the clipboard panel.
- Clearing clipboard history should require a confirmation if it deletes pinned items.

## Testing Strategy

Version 1 should include focused tests around behavior that can regress easily:

- Task create, complete, delete
- Note create and delete
- Clipboard duplicate filtering
- Clipboard pinning and clearing behavior
- Settings persistence
- IPC handler behavior where practical

Manual verification should cover:

- App starts on Windows
- Window opens and hides correctly
- Tray menu works
- Clipboard history records text
- Pause and resume clipboard recording works
- Copying an old clipboard item restores it to the system clipboard
- Metrics render without crashing

## Implementation Notes

- Prefer simple, stable UI over complex animation.
- Keep first-version process controls read-only.
- Keep app settings minimal.
- Use Claude-inspired colors, but preserve tool density and legibility.
- Avoid adding account systems, cloud sync, launchers, and timers in the first build.
