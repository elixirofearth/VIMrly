# VIMrly 🖋️

## Vim Motions Chrome Extension for Google Docs 📝

VIMrly is a Chrome Extension that integrates Vim-style keyboard shortcuts into Google Docs, enhancing text editing efficiency and user productivity. Built and tested using **TypeScript**, **Webpack**, and **Jest**, VIMrly provides a seamless modal editing experience for Vim enthusiasts working within Google Docs.



https://github.com/user-attachments/assets/ff551675-edfc-46a1-9726-0b3041dad423



## Features 📈

- **Modal Editing:** Command, Insert, and Visual modes
- **Vim Navigation:** `h`, `j`, `k`, `l` and many other Vim commands
- **Status Bar:** Real-time mode feedback at the bottom of the screen
- **Cross-Platform:** Works on Windows, macOS, and Linux
- **Seamless Integration:** Harmonious with Google Docs native functionality

## Installation ⚙️

### Prerequisites

- **Google Chrome:** Latest version
- **Node.js and npm:** For building from source

### Steps

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/elixirofearth/VIMrly.git
   cd VIMrly
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Build the Extension:**

   ```bash
   npm run build
   ```

4. **Load into Chrome:**
   - Navigate to `chrome://extensions/`
   - Enable Developer mode
   - Click **Load unpacked** and select the `dist/` folder

## Vim Commands Reference

### Mode Switching

| Command | Action                 |
| ------- | ---------------------- |
| `i`     | Enter Insert mode      |
| `v`     | Enter Visual mode      |
| `Esc`   | Return to Command mode |
| `:q`    | Turn off Vim mode      |

### Navigation (Command Mode)

| Command            | Action                  | Description                   |
| ------------------ | ----------------------- | ----------------------------- |
| `h`, `j`, `k`, `l` | Move left/down/up/right | Basic cursor movement         |
| `w`, `b`           | Next/previous word      | Word-by-word navigation       |
| `0`, `$`           | Line start/end          | Beginning and end of line     |
| `gg`, `G`          | Document start/end      | Beginning and end of document |

### Editing (Command Mode)

| Command   | Action           | Description                     |
| --------- | ---------------- | ------------------------------- |
| `d`, `dd` | Delete char/line | Delete character or entire line |
| `y`, `yy` | Yank char/line   | Copy character or entire line   |
| `p`       | Paste            | Paste clipboard contents        |
| `u`, `.`  | Undo/Redo        | History navigation              |

### Visual Mode

In Visual mode, use the same navigation keys (`h`, `j`, `k`, `l`, `w`, `b`) to extend selection, then:

- `y` - Copy selection and exit visual mode
- `d` - Delete selection and exit visual mode
- `p` - Paste and exit visual mode

## Technical Notes

- **Platform Support:** Automatically detects OS for correct key combinations
  - Windows/Linux: `Ctrl` + keys
  - macOS: `Option` for words, `Cmd` for document navigation
- **Google Docs Only:** Extension only activates on `docs.google.com`
- **Status Bar:** Shows current mode (COMMAND/INSERT/VISUAL)

## Development

```bash
# Run tests
npm test

# Build for development
npm run build

# Watch mode for development
npm run dev
```

## Contact 📞

Developed by:

- Andy Tran ([anhquoctran006@gmail.com](mailto:anhquoctran006@gmail.com))
- Viet Chu ([vchu1@ualberta.ca](mailto:vchu1@ualberta.ca))
