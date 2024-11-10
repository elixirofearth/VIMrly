import { VimState, Mode } from "./state";
import { handleCommand } from "./commands";

export const state = new VimState();
let statusBar: HTMLDivElement | null = null;

export function setMode(mode: Mode) {
  state.setMode(mode);

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

  if (statusBar) {
    statusBar.textContent = `MODE: ${state.mode}`;
    statusBar.style.display = mode === Mode.OFF ? "none" : "block";
  }
}

// Wait for Google Docs to load
function waitForDocsLoad() {
  const editorCheck = setInterval(() => {
    const editor = document.querySelector("iframe.docs-texteventtarget-iframe");
    if (editor) {
      clearInterval(editorCheck);
      init();
    }
  }, 1000);
}

function init() {
  setMode(Mode.OFF);

  // Listen for key events on the Google Docs editor iframe
  const editor = document.querySelector(
    "iframe.docs-texteventtarget-iframe"
  ) as HTMLIFrameElement;
  if (editor && editor.contentWindow) {
    const editorDocument = editor.contentWindow.document;
    editorDocument.addEventListener("keydown", handleKeydown, true);
  }
}

function handleKeydown(event: KeyboardEvent) {
  const globalKeys = ["Escape", "Esc"];

  const commandKeys = ["h", "j", "k", "l", "i", "v", "d", "b", "w", "g", "y", "p", "G", "0", "$", "u", ".", ":", "q"];
  const commandKeysCore = ["ArrowLeft", "ArrowDown", "ArrowUp", "ArrowRight", "Delete", "Home", "End"];


  // If we're in command mode
  if (state.isInCommandMode()) {
    // Allow only command keys and global keys
    // if the key is not a command key or a global key, prevent the default action
    
    if (!globalKeys.includes(event.key) && !commandKeys.includes(event.key) && !commandKeysCore.includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // If there's a pending command, prevent default for any key
    if (state.pendingCommand) {
      event.preventDefault();
      event.stopPropagation();
      handleCommand(event.key, state);
      return;
    }

    // Handle the command key
    // if the key is a command key, prevent the default action and stop the event from propagating
    if (commandKeys.includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      handleCommand(event.key, state);
    }
  }

  // If we're in visual mode
  else if (state.isInVisualMode()) {
    if (globalKeys.includes(event.key)) {
      handleCommand(event.key, state);
    }
    // Let all other keys pass through naturally
    if (!globalKeys.includes(event.key) && !commandKeys.includes(event.key) && !commandKeysCore.includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // If there's a pending command, prevent default for any key
    if (state.pendingCommand) {
      event.preventDefault();
      event.stopPropagation();
      handleCommand(event.key, state);
      return;
    }

    // Handle the command key
    // if the key is a command key, prevent the default action and stop the event from propagating
    if (commandKeys.includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      handleCommand(event.key, state);
    }
  }

  // If we're in insert mode, let all keys through EXCEPT Escape
  else if (state.isInInsertMode()) {
    if (globalKeys.includes(event.key)) {
      handleCommand(event.key, state);
    }
    // Let all other keys pass through naturally
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "toggleCommandMode") {
    const isEnabled = message.enabled;
    setMode(isEnabled ? Mode.COMMAND : Mode.OFF);
  }
});

// Start waiting for Google Docs to load
waitForDocsLoad();