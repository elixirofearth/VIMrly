import { VimState, Mode } from "./state";
import { handleCommand } from "./commands";

// Initialize Vim state
const state = new VimState();

// Add message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "toggleInsertMode") {
    console.log(`Toggling insert mode: ${message.enabled}`);
    if (message.enabled) {
      state.setMode(Mode.INSERT);
    } else {
      state.setMode(Mode.COMMAND);
    }
  }
});

// Create and display the status bar
function createStatusBar() {
  const statusBar = document.createElement("div");
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
  statusBar.textContent = `MODE: ${state.mode}`;
  document.body.appendChild(statusBar);
}

// Initialize the extension
function init() {
  createStatusBar();

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
window.addEventListener("DOMContentLoaded", init);
