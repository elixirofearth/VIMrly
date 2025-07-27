# VIMrly 🖋️

## Vim Motions Chrome Extension for Google Docs 📝

VIMrly is a Chrome Extension that integrates Vim-style keyboard shortcuts into Google Docs, enhancing text editing efficiency and user productivity. Built and tested using **TypeScript**, **Webpack**, and **Jest**, VIMrly aims to provide a seamless modal editing experience for Vim enthusiasts working within Google Docs.

## Features 📈

- **Vim-like Navigation:** Utilize `h`, `j`, `k`, `l` keys for efficient cursor movement within documents, and many other Vim commands!
- **Modal Editing:** Switch between Command, Insert, and Visual modes to control editing behaviour.
- **Status Bar:** A dynamic status bar at the bottom displays the current mode for real-time feedback.
- **Settings Popup:** Customize extension settings, such as enabling or disabling specific modes, through an intuitive popup interface.
- **Seamless Integration:** Designed to work harmoniously with Google Docs without disrupting native functionalities.

https://github.com/user-attachments/assets/1f247548-af33-443d-8e56-fdd6c2f60293

## Installation ⚙️

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
  - _This command compiles the TypeScript files, bundles the scripts and styles, and copies necessary assets into the `dist/` directory._

4. **Load the Extension into Chrome**:
  - Open Chrome and navigate to `chrome://extensions/`.
  - Enable Developer mode by toggling the switch in the top right corner.
  - Click on **Load unpacked** and select the `dist/` folder from the cloned repository.
  - The **VIMrly** extension should now appear in your list of extensions and its icon in the Chrome toolbar.

## Contact 📞

Developed by:

- Andy Tran ([anhquoctran006@gmail.com](mailto:anhquoctran006@gmail.com))
- Viet Chu ([vchu1@ualberta.ca](mailto:vchu1@ualberta.ca))
