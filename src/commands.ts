import { VimState, Mode } from "./state";
import { setMode, state } from "./content";

declare module "./state" {
  interface VimState {
    clipboard: string;
    setClipboard(text: string): void;
    getClipboard(): string;
  }
}

// Google Docs specific utilities
const getEditor = (): Document | null => {
  const iframe = document.querySelector(
    "iframe.docs-texteventtarget-iframe"
  ) as HTMLIFrameElement;
  return iframe?.contentWindow?.document || null;
};


const simulateNativeEvent = (
  element: Element,
  eventType: string,
  options: KeyboardEventInit = {}
) => {
  const event = new KeyboardEvent(eventType, {
    bubbles: true,
    cancelable: true,
    view: window,
    ...options,
  });
  
  // Override preventDefault to ensure the event isn't blocked
  Object.defineProperty(event, 'preventDefault', {
    value: () => {},
    writable: false
  });

  console.log("Simulating Native event", event);
  element.dispatchEvent(event);
};

export function handleCommand(key: string, state: VimState) {
  if (state.isInCommandMode()) {
    handleCommandMode(key, state);
  } else if (state.isInInsertMode()) {
    handleInsertMode(key, state);
  } else if (state.isInVisualMode()) {
    console.log("Handling visual mode:", key);
    handleVisualMode(key, state);
  }
}

function handleCommandMode(key: string, state: VimState) {
  const editor = getEditor();
  if (!editor) return;
  console.log("Handling command:", key);

  // Handle colon commands
  if (key === ":") {
    state.setPendingCommand(":");
    return;
  }

   // Handle double-letter commands
  if (state.pendingCommand) {
    const fullCommand = state.pendingCommand + key;
    console.log("Full command:", fullCommand);
    state.setLastCommand(key);
    state.setPendingCommand("");

    switch (fullCommand) {
      case "gg":
        console.log("Moving to doc start");
        moveCursorToDocStart(editor);
        return;
      case "yy":
        yankLine(state);
        return;
      case "dd":
        deleteCurrentLine(editor);
        return;
      case ":q":
        setMode(Mode.OFF);
        clearSelection(editor);
        state.setPendingCommand("");       
        return;
    }
  } 

    // Set a pending command for potential double-letter commands and add a timeout
    if (key === "g" || key === "y" || key === "d") {
      state.setPendingCommand(key);
      let commandTimeout = setTimeout(() => {
        console.log("Single key command:", key);
        state.setPendingCommand("");
        // Execute single-key command if no second key is pressed
        switch (key) {
          case "d":
            deleteText(editor);
            break;
          case "y":
            yankText(state);
            break;
        }
      }, 500); // 500 ms timeout for a second key
      return;
    }

  // Clear any pending command if a different key is pressed
  state.setPendingCommand("");
  state.setLastCommand(key);


  switch (key) {
    case "i":
      state.setMode(Mode.INSERT);
      break;
    case "v":
      state.setMode(Mode.VISUAL);
      break;
    case "h":
      moveCursorLeft(editor);
      break;
    case "j":
      moveCursorDown(editor);
      break;
    case "k":
      moveCursorUp(editor);
      break;
    case "l":
      moveCursorRight(editor);
      break;
    case "w":
      moveToNextWord(editor);
      break;
    case "d":
      if (state.isInVisualMode()) {
        deleteSelectedText(state);
      } else {
        deleteText(editor);
      }
      break;
    case "y":
      yankText(state);
      break;
    case "p":
      pasteText(state);
      break;
    case "0":
      moveCursorToLineStart(editor);
      break;
    case "b":
      moveToBackWord(editor);
      break
    case "$":
      moveCursorToLineEnd(editor);
      break;
    case "g":
      moveCursorToDocStart(editor);
      break;
    case "G":
      moveCursorToDocEnd(editor);
      break;
    case "u":
      performUndo();
      break;
    case ".":
      performRedo();
      break;
  }
}

function yankLine(state: VimState) {
  const editor = getEditor();
  if (!editor) return;

  // First move to the start of the line
  moveCursorToLineStart(editor);
  
  // Press Shift+End to select to end of line
  simulateNativeEvent(editor.body, "keydown", {
    key: "End",
    code: "End",
    keyCode: 35,
    which: 35,
    shiftKey: true
  });

  const copyMenuItem = document.querySelector('[aria-label="Copy c"]');
  if (copyMenuItem) {
    simulateClick(copyMenuItem as HTMLElement);
    console.log("Copy menu item clicked successfully");
  } else {
    console.error("Copy menu item not found");
  }
  
}

function handleInsertMode(key: string, state: VimState) {
  if (key === "Escape" || key === "Esc") {
    state.setMode(Mode.COMMAND);
    const editor = getEditor();
    if (editor) {
      editor.body.blur();
    }
  }
}

function handleVisualMode(key: string, state: VimState) {
  const editor = getEditor();
  if (!editor) return;
  if (key === "Escape" || key === "Esc") {
    state.setMode(Mode.COMMAND);
    clearSelection(editor);
  } else {
    switch (key) {
      case "h":
        extendSelectionLeft(editor);
        break;
      case "j":
        extendSelectionDown(editor);
        break;
      case "k":
        extendSelectionUp(editor);
        break;
      case "l":
        extendSelectionRight(editor);
        break;
      case "y":
        yankText(state);
        state.setMode(Mode.COMMAND);
        break;
      case "w":
        moveToNextWord(editor, true);
        break;
      case "b":
        console.log("Moving back a word");
        moveToBackWord(editor, true);
        break
      case "p":
        pasteText(state);
        state.setMode(Mode.COMMAND);
        break;
      case "d":
        deleteSelectedText(state);
        state.setMode(Mode.COMMAND);
        break;
      case "u":
        performUndo();
        break;
      case ".":
        performRedo();
        break;
    }
  }
}

function yankText(state: VimState) {
  // Simulated event Shift+ArrowRight to select text
  const editor = getEditor();
  if (!editor) return;

  simulateNativeEvent(editor.body, "keydown", {
    key: "ArrowRight",
    code: "ArrowRight",
    keyCode: 39,
    which: 39,
    shiftKey: true,
    ctrlKey: false
    
  });

  const copyMenuItem = document.querySelector('[aria-label="Copy c"]');
  if (copyMenuItem) {
    simulateClick(copyMenuItem as HTMLElement);
    console.log("Copy menu item clicked successfully");
  } else {
    console.error("Copy menu item not found");
  }

}


function pasteText(state: VimState) {
  navigator.clipboard.readText()
    .then(text => {
      const editor = getEditor();
      if (!editor) return;
      
      // Method 1: Use keyboard input events to insert text
      const input = new InputEvent('insertText', {
        bubbles: true,
        cancelable: true,
        data: text,
        inputType: 'insertText'
      });
      
      editor.body.dispatchEvent(input);
      
      // Method 2: If Method 1 fails, try simulating keyboard input
      if (!editor.body.textContent?.includes(text)) {
        Array.from(text).forEach(char => {
          const keyEvent = new KeyboardEvent('keypress', {
            key: char,
            code: 'Key' + char.toUpperCase(),
            charCode: char.charCodeAt(0),
            keyCode: char.charCodeAt(0),
            which: char.charCodeAt(0),
            bubbles: true,
            cancelable: true,
            composed: true
          });
          editor.body.dispatchEvent(keyEvent);
        });
      }
    })
    .catch(err => console.error('Failed to read clipboard:', err));
}

function deleteSelectedText(state: VimState) {
  const editor = getEditor();
  if (!editor) return;

  // Press Delete to delete the selected text 
  console.log("Deleting selected text");
  simulateNativeEvent(editor.body, "keydown", {
    key: "Delete",
    code: "Delete",
    keyCode: 46,
    which: 46
  });
}

function clearSelection(editor: Document) {
  editor.getSelection()?.removeAllRanges();
}

function moveCursorLeft(editor: Document) {
  simulateNativeEvent(editor.body, "keydown", { 
    key: "ArrowLeft", 
    code: "ArrowLeft", 
    keyCode: 37, 
    which: 37 
  });
}

function moveCursorRight(editor: Document) {
  simulateNativeEvent(editor.body, "keydown", { 
    key: "ArrowRight", 
    code: "ArrowRight", 
    keyCode: 39, 
    which: 39 
  });
}

function moveCursorUp(editor: Document) {
  simulateNativeEvent(editor.body, "keydown", { 
    key: "ArrowUp", 
    code: "ArrowUp", 
    keyCode: 38, 
    which: 38 
  });
}

function moveCursorDown(editor: Document) {
  simulateNativeEvent(editor.body, "keydown", { 
    key: "ArrowDown", 
    code: "ArrowDown", 
    keyCode: 40, 
    which: 40 
  });
}

function moveCursorToLineStart(editor: Document) {
  simulateNativeEvent(editor.body, "keydown", { 
    key: "Home", 
    code: "Home", 
    keyCode: 36, 
    which: 36 
  });
}

function moveCursorToLineEnd(editor: Document) {
  simulateNativeEvent(editor.body, "keydown", { 
    key: "End", 
    code: "End", 
    keyCode: 35, 
    which: 35 
  });
}

function deleteText(editor: Document) {
  simulateNativeEvent(editor.body, "keydown", { 
    key: "Delete", 
    code: "Delete", 
    keyCode: 46, 
    which: 46 
  });
}

function deleteCurrentLine(editor: Document) {
  // First move to the start of the line
  moveCursorToLineStart(editor);
  
  // Press Shift+End to select to end of line
  simulateNativeEvent(editor.body, "keydown", {
    key: "End",
    code: "End",
    keyCode: 35,
    which: 35,
    shiftKey: true
  });

  // Press Delete to delete the line
  simulateNativeEvent(editor.body, "keydown", {
    key: "Delete",
    code: "Delete",
    keyCode: 46,
    which: 46
  });
}


function extendSelectionLeft(editor: Document) {
  simulateNativeEvent(editor.body, "keydown", { 
    key: "ArrowLeft", 
    code: "ArrowLeft", 
    keyCode: 37, 
    which: 37, 
    shiftKey: true 
  });
}

function extendSelectionRight(editor: Document) {
  simulateNativeEvent(editor.body, "keydown", { 
    key: "ArrowRight", 
    code: "ArrowRight", 
    keyCode: 39, 
    which: 39, 
    shiftKey: true 
  });
}

function extendSelectionUp(editor: Document) {
  simulateNativeEvent(editor.body, "keydown", { 
    key: "ArrowUp", 
    code: "ArrowUp", 
    keyCode: 38, 
    which: 38, 
    shiftKey: true 
  });
}

function extendSelectionDown(editor: Document) {
  simulateNativeEvent(editor.body, "keydown", { 
    key: "ArrowDown", 
    code: "ArrowDown", 
    keyCode: 40, 
    which: 40, 
    shiftKey: true 
  });
}

function moveToNextWord(editor: Document, visualMode = false) {
  // In Google Docs, Ctrl+ArrowRight moves to the next word
  // use ctrlKey: true to simulate Ctrl key press if in Windows
  let packet = {
    key: "ArrowRight",
    code: "ArrowRight",
    keyCode: 39,
    which: 39,
    ctrlKey: true,
    shiftKey: false,
    metaKey: false
  }
  if (visualMode) {
    packet.shiftKey = true;
  }

  // Detect if the user is on macOS using userAgent
  const isMac = /Mac/i.test(navigator.userAgent);
  if (isMac) {
    packet.metaKey = true;
    packet.ctrlKey = false;
  }

  simulateNativeEvent(editor.body, "keydown", packet);
}

function moveToBackWord(editor: Document, visualMode = false) {
  let packet = {
    key: "ArrowLeft",
    code: "ArrowLeft",
    keyCode: 37,
    which: 37,
    ctrlKey: true,
    shiftKey: false,
    metaKey: false
  }
  if (visualMode) {
    packet.shiftKey = true;
  }
  // Detect if the user is on macOS using userAgent
  const isMac = /Mac/i.test(navigator.userAgent);
  if (isMac) {
    packet.metaKey = true;
    packet.ctrlKey = false;
  }

  // In Google Docs, Ctrl+ArrowLeft moves to the previous word
  simulateNativeEvent(editor.body, "keydown", packet);
}

function moveCursorToDocStart(editor: Document) {
  // In Google Docs, Ctrl+Home moves to the start of the document
  simulateNativeEvent(editor.body, "keydown", {
    key: "Home",
    code: "Home",
    keyCode: 36,
    which: 36,
    ctrlKey: true
  });
}

function moveCursorToDocEnd(editor: Document) {
  // In Google Docs, Ctrl+End moves to the end of the document
  simulateNativeEvent(editor.body, "keydown", {
    key: "End",
    code: "End",
    keyCode: 35,
    which: 35,
    ctrlKey: true
  });
}


function simulateClick(element: HTMLElement) {
  const mousedownEvent = new MouseEvent("mousedown", {
    bubbles: true,
    cancelable: true,
    view: window,
  });
  const mouseupEvent = new MouseEvent("mouseup", {
    bubbles: true,
    cancelable: true,
    view: window,
  });
  const clickEvent = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    view: window,
  });

  element.dispatchEvent(mousedownEvent);
  element.dispatchEvent(mouseupEvent);
  element.dispatchEvent(clickEvent);
}



function performUndo() {
  const undoButton = document.querySelector('div[data-tooltip="Undo (Ctrl+Z)"]') as HTMLElement;
  const undoButtonMac = document.querySelector('div[data-tooltip="Undo (⌘Z)"]') as HTMLElement;

  if (undoButton) {
    simulateClick(undoButton);
  } else if (undoButtonMac) {
    simulateClick(undoButtonMac);
  } else {
    console.warn("Undo button not found.");
  }
}
function performRedo() {
  const redoButton = document.querySelector('div[data-tooltip="Redo (Ctrl+Y)"]') as HTMLElement;
  const redoButtonMac = document.querySelector('div[data-tooltip="Redo (⌘Y)"]') as HTMLElement;
  if (redoButton) {
    simulateClick(redoButton);
  } else if (redoButtonMac) {
    simulateClick(redoButtonMac);
  } else {
    console.warn("Redo button not found.");
  }
}
