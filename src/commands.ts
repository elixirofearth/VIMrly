import { VimState, Mode } from "./state";

// Add clipboard state to VimState
declare module "./state" {
  interface VimState {
    clipboard: string;
    setClipboard(text: string): void;
    getClipboard(): string;
  }
}

export function handleCommand(key: string, state: VimState) {
  if (state.isInNormalMode()) {
    handleNormalMode(key, state);
  } else if (state.isInInsertMode()) {
    handleInsertMode(key, state);
  } else if (state.isInVisualMode()) {
    handleVisualMode(key, state);
  }
}

function handleNormalMode(key: string, state: VimState) {
  switch (key) {
    case "i":
      state.setMode(Mode.INSERT);
      break;
    case "v":
      state.setMode(Mode.VISUAL);
      break;
    case "h":
      moveCursorLeft();
      break;
    case "j":
      moveCursorDown();
      break;
    case "k":
      moveCursorUp();
      break;
    case "l":
      moveCursorRight();
      break;
    case "d":
      if (state.isInVisualMode()) {
        deleteSelectedText(state);
      } else {
        deleteCurrentLine();
      }
      break;
    case "y":
      yankText(state);
      break;
    case "p":
      pasteText(state);
      break;
    case "0":
      moveCursorToLineStart();
      break;
    case "$":
      moveCursorToLineEnd();
      break;
    default:
      console.log(`Unrecognized command: ${key}`);
      break;
  }
}

function handleInsertMode(key: string, state: VimState) {
  if (key === "Escape" || key === "Esc") {
    state.setMode(Mode.NORMAL);
  }
}

function handleVisualMode(key: string, state: VimState) {
  if (key === "Escape" || key === "Esc") {
    state.setMode(Mode.NORMAL);
    clearSelection();
  } else {
    switch (key) {
      case "h":
        extendSelectionLeft();
        break;
      case "j":
        extendSelectionDown();
        break;
      case "k":
        extendSelectionUp();
        break;
      case "l":
        extendSelectionRight();
        break;
      case "y":
        yankText(state);
        state.setMode(Mode.NORMAL);
        break;
      case "d":
        deleteSelectedText(state);
        state.setMode(Mode.NORMAL);
        break;
    }
  }
}

function yankText(state: VimState) {
  const selection = window.getSelection();
  if (selection && selection.toString()) {
    state.setClipboard(selection.toString());
    clearSelection();
  } else {
    // If no selection, yank current line
    simulateKeyPressWithModifiers(["Control", "Shift"], "ArrowLeft");
    const lineSelection = window.getSelection();
    if (lineSelection) {
      state.setClipboard(lineSelection.toString());
      clearSelection();
    }
  }
}

function pasteText(state: VimState) {
  const clipboardText = state.getClipboard();
  if (clipboardText) {
    // Use the browser's clipboard API to paste text
    navigator.clipboard.writeText(clipboardText).then(() => {
      simulateKeyPressWithModifiers(["Control"], "v");
    });
  }
}

function deleteSelectedText(state: VimState) {
  const selection = window.getSelection();
  if (selection && selection.toString()) {
    state.setClipboard(selection.toString()); // Save to clipboard before deleting
    simulateKeyPress("Delete");
  }
}

function clearSelection() {
  window.getSelection()?.removeAllRanges();
}

function extendSelectionLeft() {
  simulateKeyPressWithModifiers(["Shift"], "ArrowLeft");
}

function extendSelectionRight() {
  simulateKeyPressWithModifiers(["Shift"], "ArrowRight");
}

function extendSelectionUp() {
  simulateKeyPressWithModifiers(["Shift"], "ArrowUp");
}

function extendSelectionDown() {
  simulateKeyPressWithModifiers(["Shift"], "ArrowDown");
}

function moveCursorToLineStart() {
  simulateKeyPress("Home");
}

function moveCursorToLineEnd() {
  simulateKeyPress("End");
}

// Existing movement and utility functions remain the same
function moveCursorLeft() {
  simulateKeyPress("ArrowLeft");
}

function moveCursorRight() {
  simulateKeyPress("ArrowRight");
}

function moveCursorUp() {
  simulateKeyPress("ArrowUp");
}

function moveCursorDown() {
  simulateKeyPress("ArrowDown");
}

function deleteCurrentLine() {
  simulateKeyPressWithModifiers(["Control", "Shift"], "ArrowLeft");
  simulateKeyPress("Backspace");
}

function simulateKeyPress(key: string) {
  const event = new KeyboardEvent("keydown", {
    key: key,
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(event);
}

function simulateKeyPressWithModifiers(modifiers: string[], key: string) {
  const eventInit: KeyboardEventInit = {
    key: key,
    bubbles: true,
    cancelable: true,
    shiftKey: modifiers.includes("Shift"),
    ctrlKey: modifiers.includes("Control"),
    altKey: modifiers.includes("Alt"),
    metaKey: modifiers.includes("Meta"),
  };
  const event = new KeyboardEvent("keydown", eventInit);
  document.dispatchEvent(event);
}
