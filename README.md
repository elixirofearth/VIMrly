# VIMrly 🖋️

## Vim Motions Chrome Extension for Google Docs 📝

VIMrly is a Chrome Extension that integrates Vim-style keyboard shortcuts into Google Docs, enhancing text editing efficiency and user productivity. Initially developed collaboratively during the **DevelopEd 3.0 Hackathon (2024)** 🏆 and further advanced 🚀, VIMrly aims to provide a seamless modal editing experience for Vim enthusiasts working within Google Docs.

## Features

- **Vim-like Navigation:** Utilize `h`, `j`, `k`, `l` keys for efficient cursor movement within documents, and many other commands!
- **Modal Editing:** Switch between Command, Insert, and Visual modes to control editing behavior.
- **Status Bar:** A dynamic status bar at the bottom displays the current mode for real-time feedback.
- **Settings Popup:** Customize extension settings, such as enabling or disabling specific modes, through an intuitive popup interface.
- **Seamless Integration:** Designed to work harmoniously with Google Docs without disrupting native functionalities.

## Installation

### Prerequisites

- **Google Chrome:** Ensure you have the latest version of Google Chrome installed.
- **Node.js and npm:** Required for building the extension from source.

### Steps

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/andynapoleon/VIMrly.git
   cd VIMrly
   ```

2. **Install Dependencies**:
   
  ```bash
  npm install
  ```

3. **Build the Extension**:
  
  ```bash
  npm run build
  ```

  _This command compiles the TypeScript files, bundles the scripts and styles, and copies necessary assets into the `dist/` directory._

4. **Load the Extension into Chrome**:
  - Open Chrome and navigate to `chrome://extensions/`.
  - Enable Developer mode by toggling the switch on the top right corner.
  - Click on **Load unpacked** and select the `dist/` folder from the cloned repository.
  - The **VIMrly** extension should now appear in your list of extensions and its icon in the Chrome toolbar.

## Usage

### Open Google Docs:

Navigate to Google Docs and open an existing document or create a new one.

### Activate Vim Keybindings:
- **Normal Mode:**
    - Use `h` to move cursor left.
    - Use `j` to move cursor down.
    - Use `k` to move cursor up.
    - Use `l` to move cursor right.
- **Insert Mode:**
    - Press `i` to enter Insert Mode and type as usual.
    - Press `Escape` to return to Normal Mode.
- **Visual Mode:**
    - Press `v` to enter Visual Mode for text selection.
    - Press `Escape` to return to Normal Mode.
  
  _You can look at the code for other interesting commands and try them out yourself!_

### Access Settings:
Click on the **VIMrly** extension icon in the Chrome toolbar to open the settings popup. Toggle options such as enabling or disabling Command Mode to customize your editing experience.

### Monitor Mode Status:
Observe the status bar at the bottom of the Google Docs interface, which displays the current mode (COMMAND, INSERT, or VISUAL).

## License

This project is licensed under the Apache-2.0 License.

## Contact

Developed by:

- Andy Tran ([anhquoctran006@gmail.com](mailto:anhquoctran006@gmail.com))
- Viet Chu ([vchu1@ualberta.ca](mailto:vchu1@ualberta.ca))

Feel free to reach out for any questions or support regarding the **VIMrly** extension.
