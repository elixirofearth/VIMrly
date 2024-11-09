import { VimState, Mode } from "./state";
import { handleCommand } from "./commands";

const state = new VimState();
let statusBar: HTMLDivElement | null = null;

function setMode(mode: Mode) {
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

  if (!state.isInOffMode() && interceptedKeys.includes(event.key)) {
    event.preventDefault();
    event.stopPropagation();
    handleCommand(event.key, state);
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
