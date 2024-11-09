import { VimState, Mode } from "./state";
import { handleCommand } from "./commands";

// Initialize Vim state
const state = new VimState();

// Create the status bar element
let statusBar: HTMLDivElement | null = null;


// Function to handle the state update based on mode
function setMode(mode: Mode) {
  state.setMode(mode);
  
  // Create the status bar only if it doesn't exist
  if (!statusBar) {
    statusBar = document.createElement("div");
    statusBar.id = "vim-status-bar";
    statusBar.style.position = "fixed";
    statusBar.style.bottom = "0";
    statusBar.style.left = "0";
    statusBar.style.width = "100%";
    statusBar.style.height = "20px";
    statusBar.style.backgroundColor = "#2e3436";
    statusBar.style.color = "#ffffff";
    statusBar.style.fontFamily = "monospace";
    statusBar.style.fontSize = "12px";
    statusBar.style.textAlign = "center";
    statusBar.style.zIndex = "9999";
    document.body.appendChild(statusBar);
  }

  // Show or hide the status bar based on mode
  if (statusBar) {
    if (mode === Mode.COMMAND) {
      statusBar.textContent = `MODE: ${state.mode}`;
      statusBar.style.display = "block"; // Show status bar when in COMMAND mode
    } else {
      statusBar.style.display = "none"; // Hide status bar when in OFF mode
    }
  }
}

// Add message listener for toggling the command mode
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "toggleCommandMode") {
    const isEnabled = message.enabled;
    if (isEnabled) {
      setMode(Mode.COMMAND); // Set to COMMAND mode
    } else {
      setMode(Mode.OFF); // Set to OFF mode
    }
  }
});

// Initialize the extension
function init() {
  // Ensure the DOM is ready before proceeding
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onDomContentLoaded);
  } else {
    onDomContentLoaded();
  }
}

// Fallback when DOM is loaded
function onDomContentLoaded() {
  setMode(Mode.OFF); // Set to OFF by default
  document.addEventListener("keydown", (event) => {
    const activeElement = document.activeElement as HTMLElement;

    // If in Insert mode and focused on input fields, do not intercept
    if (
      state.isInInsertMode() &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.isContentEditable)
    ) {
      return;
    }

    // Prevent default behavior for intercepted keys
    const interceptedKeys = [
      "h",
      "j",
      "k",
      "l",
      "i",
      "v",
      "d",
      "y",
      "p",
      "Escape",
      "Esc",
    ];
    if (interceptedKeys.includes(event.key)) {
      event.preventDefault();
      handleCommand(event.key, state);
    }
  });
}

// Wait for the DOM to load before initializing
init();
