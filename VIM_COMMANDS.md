# VIMrly - Implemented Vim Commands

This document provides a comprehensive list of all Vim commands implemented in the VIMrly Chrome extension for Google Docs.

## Overview

VIMrly is a Chrome extension that brings Vim-style keyboard shortcuts to Google Docs. The extension supports three main modes:

- **Command Mode**: Default mode for navigation and commands
- **Insert Mode**: For text input
- **Visual Mode**: For text selection

## Mode Switching

| Command | Action                                         |
| ------- | ---------------------------------------------- |
| `i`     | Enter Insert mode                              |
| `v`     | Enter Visual mode                              |
| `Esc`   | Return to Command mode (from Insert or Visual) |
| `:q`    | Turn off Vim mode entirely                     |

## Navigation Commands (Command Mode)

### Basic Movement

| Command | Action     | Description                            |
| ------- | ---------- | -------------------------------------- |
| `h`     | Move left  | Move cursor one character to the left  |
| `j`     | Move down  | Move cursor one line down              |
| `k`     | Move up    | Move cursor one line up                |
| `l`     | Move right | Move cursor one character to the right |

### Word Movement

| Command | Action        | Description                                |
| ------- | ------------- | ------------------------------------------ |
| `w`     | Next word     | Move to the beginning of the next word     |
| `b`     | Previous word | Move to the beginning of the previous word |

### Line Movement

| Command | Action     | Description                               |
| ------- | ---------- | ----------------------------------------- |
| `0`     | Line start | Move to the beginning of the current line |
| `$`     | Line end   | Move to the end of the current line       |

### Document Movement

| Command | Action         | Description                           |
| ------- | -------------- | ------------------------------------- |
| `g`     | Document start | Move to the beginning of the document |
| `G`     | Document end   | Move to the end of the document       |

## Editing Commands (Command Mode)

### Deletion

| Command | Action           | Description                           |
| ------- | ---------------- | ------------------------------------- |
| `d`     | Delete character | Delete the character under the cursor |
| `dd`    | Delete line      | Delete the entire current line        |

### Yanking (Copying)

| Command | Action         | Description                         |
| ------- | -------------- | ----------------------------------- |
| `y`     | Yank character | Copy the character under the cursor |
| `yy`    | Yank line      | Copy the entire current line        |

### Pasting

| Command | Action | Description                         |
| ------- | ------ | ----------------------------------- |
| `p`     | Paste  | Paste the contents of the clipboard |

## History Commands (Command Mode)

| Command | Action | Description                 |
| ------- | ------ | --------------------------- |
| `u`     | Undo   | Undo the last action        |
| `.`     | Redo   | Redo the last undone action |

## Visual Mode Commands

### Movement (with Selection)

| Command | Action                  | Description                                            |
| ------- | ----------------------- | ------------------------------------------------------ |
| `h`     | Extend left             | Extend selection one character to the left             |
| `j`     | Extend down             | Extend selection one line down                         |
| `k`     | Extend up               | Extend selection one line up                           |
| `l`     | Extend right            | Extend selection one character to the right            |
| `w`     | Extend to next word     | Extend selection to the beginning of the next word     |
| `b`     | Extend to previous word | Extend selection to the beginning of the previous word |

### Visual Mode Actions

| Command | Action           | Description                                   |
| ------- | ---------------- | --------------------------------------------- |
| `y`     | Yank selection   | Copy the selected text and exit visual mode   |
| `d`     | Delete selection | Delete the selected text and exit visual mode |
| `p`     | Paste            | Paste text and exit visual mode               |
| `u`     | Undo             | Undo the last action                          |
| `.`     | Redo             | Redo the last undone action                   |

## Insert Mode

Insert mode allows normal text input. The only Vim-specific command in insert mode is:

| Command | Action           | Description            |
| ------- | ---------------- | ---------------------- |
| `Esc`   | Exit insert mode | Return to command mode |

## Technical Implementation Details

### Double-Letter Commands

The extension implements a timeout mechanism for double-letter commands:

- Commands like `gg`, `yy`, `dd` are handled with a 500ms timeout
- If no second key is pressed within the timeout, the single key command is executed

### Platform-Specific Key Combinations

The extension automatically detects the operating system and uses appropriate key combinations:

- **Windows/Linux**: Uses `Ctrl` key combinations
- **macOS**: Uses `Cmd` (meta) key combinations

### Google Docs Integration

The extension works by:

1. Injecting into Google Docs iframe
2. Simulating native keyboard events
3. Intercepting and preventing default behavior for Vim commands
4. Using Google Docs' native copy/paste functionality

### Status Bar

A status bar at the bottom of the screen displays the current mode:

- Shows "MODE: COMMAND", "MODE: INSERT", or "MODE: VISUAL"
- Hidden when Vim mode is turned off

## Browser Compatibility

- **Target**: Google Chrome
- **Permissions**:
  - `activeTab`: For accessing the current tab
  - `scripting`: For injecting scripts
  - `storage`: For saving settings
  - `clipboardRead`/`clipboardWrite`: For copy/paste operations
- **Host Permissions**: `https://docs.google.com/*`

## Limitations

1. **Google Docs Specific**: Only works within Google Docs documents
2. **Iframe Limitations**: Must work within Google Docs' iframe structure
3. **Event Simulation**: Relies on simulating native keyboard events
4. **Copy/Paste**: Uses Google Docs' native copy/paste menu items

## Future Enhancements

Potential areas for expansion:

- Count prefixes (e.g., `3w` to move 3 words)
- More complex motions (e.g., `f`, `t`, `%`)
- Text objects (e.g., `diw`, `daw`)
- Search commands (`/`, `?`)
- Marks and registers
- Macros recording and playback
