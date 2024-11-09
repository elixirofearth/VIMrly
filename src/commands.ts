import { VimState, Mode } from "./state";

export function handleCommand(key: string, state: VimState) {
  if (state.isInNormalMode()) {
    if (key === "i") {
      state.setMode(Mode.INSERT);
    } else if (key === "v") {
      state.setMode(Mode.VISUAL);
    } else if (key === "h") {
      moveCursorLeft();
    } else if (key === "j") {
      moveCursorDown();
    } else if (key === "k") {
      moveCursorUp();
    } else if (key === "l") {
      moveCursorRight();
    }
  } else if (state.isInInsertMode()) {
    if (key === "Escape") {
      state.setMode(Mode.NORMAL);
    }
  }
}

function moveCursorLeft() {
  console.log("Moving cursor left.");
  // Implement cursor movement logic for Google Docs
}

function moveCursorDown() {
  console.log("Moving cursor down.");
  // Implement cursor movement logic for Google Docs
}

function moveCursorUp() {
  console.log("Moving cursor up.");
  // Implement cursor movement logic for Google Docs
}

function moveCursorRight() {
  console.log("Moving cursor right.");
  // Implement cursor movement logic for Google Docs
}
