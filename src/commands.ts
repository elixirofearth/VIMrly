import { VimState, Mode } from "./state";

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

const getEditorCanvas = (): Element | null => {
  return document.querySelector(".kix-appview-editor");
};

const simulateNativeEvent = (
  element: Element,
  eventType: string,
  options: KeyboardEventInit = {}
) => {
  const event = new KeyboardEvent(eventType, {
    bubbles: true,
    cancelable: true,
    ...options,
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
    handleVisualMode(key, state);
  }
}

function handleCommandMode(key: string, state: VimState) {
  const editor = getEditor();
  if (!editor) return;

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
    case "d":
      if (state.isInVisualMode()) {
        deleteSelectedText(state);
      } else {
        deleteCurrentLine(editor);
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
    case "$":
      moveCursorToLineEnd(editor);
      break;
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
      case "d":
        deleteSelectedText(state);
        state.setMode(Mode.COMMAND);
        break;
    }
  }
}

function yankText(state: VimState) {
  const editor = getEditor();
  if (!editor) return;

  document.execCommand("copy");
  const selection = editor.getSelection();
  if (selection?.toString()) {
    state.setClipboard(selection.toString());
    clearSelection(editor);
  }
}

function pasteText(state: VimState) {
  const editor = getEditor();
  if (!editor) return;

  const clipboardText = state.getClipboard();
  if (clipboardText) {
    navigator.clipboard.writeText(clipboardText).then(() => {
      document.execCommand("paste");
    });
  }
}

function deleteSelectedText(state: VimState) {
  const editor = getEditor();
  if (!editor) return;

  const selection = editor.getSelection();
  if (selection?.toString()) {
    state.setClipboard(selection.toString());
    document.execCommand("delete");
  }
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

function deleteCurrentLine(editor: Document) {
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

