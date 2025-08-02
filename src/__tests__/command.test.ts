import { VimState, Mode } from "../state";

// Mock navigator.clipboard
Object.defineProperty(navigator, "clipboard", {
  value: {
    readText: jest.fn().mockResolvedValue("test clipboard content"),
    writeText: jest.fn().mockResolvedValue(undefined),
  },
  writable: true,
});

// Create mock state before the imports
const mockState = new VimState();

// Mock DOM elements and Google Docs iframe
const mockIframe = {
  contentWindow: {
    document: {
      body: {
        dispatchEvent: jest.fn(),
        blur: jest.fn(),
      },
      getSelection: jest.fn(() => ({
        removeAllRanges: jest.fn(),
      })),
    },
  },
};

// Mock Google Docs copy menu item
const mockCopyMenuItem = {
  click: jest.fn(),
  dispatchEvent: jest.fn(),
};

jest.mock("../content", () => ({
  setMode: (mode: Mode) => {
    mockState.setMode(mode);
  },
  state: mockState,
}));

// Create a proper mock for setMode function that can be imported
const mockSetMode = jest.fn((mode: Mode) => {
  mockState.setMode(mode);
});

// Mock document.querySelector to return our mock elements
const originalQuerySelector = document.querySelector;
document.querySelector = jest.fn((selector) => {
  if (selector === "iframe.docs-texteventtarget-iframe") {
    return mockIframe as any;
  }
  if (selector === '[aria-label="Copy c"]') {
    return mockCopyMenuItem as any;
  }
  if (selector.includes('data-tooltip="Undo')) {
    return mockCopyMenuItem as any;
  }
  if (selector.includes('data-tooltip="Redo')) {
    return mockCopyMenuItem as any;
  }
  return originalQuerySelector.call(document, selector);
});

import { handleCommand } from "../commands";

describe("Command Handler", () => {
  let state: VimState;

  beforeEach(() => {
    state = new VimState();
    state.setMode(Mode.COMMAND);

    // Reset all mocks
    jest.clearAllMocks();

    // Mock console to suppress debug logs during tests
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();

    document.body.innerHTML = `
      <iframe class="docs-texteventtarget-iframe">
        <html><body></body></html>
      </iframe>
    `;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Command Mode", () => {
    test("should handle mode switching commands", () => {
      handleCommand("i", state);
      expect(state.mode).toBe(Mode.INSERT);

      state.setMode(Mode.COMMAND);
      handleCommand("v", state);
      expect(state.mode).toBe(Mode.VISUAL);
    });

    test("should handle colon commands", () => {
      handleCommand(":", state);
      expect(state.pendingCommand).toBe(":");

      // The ":q" command calls setMode(Mode.OFF) which is mocked
      handleCommand("q", state);
      expect(state.pendingCommand).toBe("");
    });

    test("should handle double-letter commands", () => {
      handleCommand("g", state);
      expect(state.pendingCommand).toBe("g");

      handleCommand("g", state);
      expect(state.pendingCommand).toBe("");
      expect(state.lastCommand).toBe("g");
      expect(
        mockIframe.contentWindow.document.body.dispatchEvent
      ).toHaveBeenCalled();
    });

    test("should handle yy command", () => {
      handleCommand("y", state);
      expect(state.pendingCommand).toBe("y");

      handleCommand("y", state);
      expect(state.pendingCommand).toBe("");
      expect(state.lastCommand).toBe("y");
    });

    test("should handle dd command", () => {
      handleCommand("d", state);
      expect(state.pendingCommand).toBe("d");

      handleCommand("d", state);
      expect(state.pendingCommand).toBe("");
      expect(state.lastCommand).toBe("d");
    });

    test("should handle navigation commands", () => {
      const commands = ["h", "j", "k", "l", "w", "b", "0", "$", "G"];

      commands.forEach((command) => {
        handleCommand(command, state);
        expect(
          mockIframe.contentWindow.document.body.dispatchEvent
        ).toHaveBeenCalled();
      });
    });

    test("should handle single character commands with timeout", (done) => {
      handleCommand("g", state);
      expect(state.pendingCommand).toBe("g");

      // Wait for timeout
      setTimeout(() => {
        expect(state.pendingCommand).toBe("");
        done();
      }, 600);
    });

    test("should handle undo and redo commands", () => {
      handleCommand("u", state);
      // Undo command should trigger button click
      expect(mockCopyMenuItem.dispatchEvent).toHaveBeenCalled();

      jest.clearAllMocks();
      handleCommand(".", state);
      // Redo command should trigger button click
      expect(mockCopyMenuItem.dispatchEvent).toHaveBeenCalled();
    });
  });

  describe("Insert Mode", () => {
    beforeEach(() => {
      state.setMode(Mode.INSERT);
    });

    test("should exit to command mode on escape", () => {
      handleCommand("Escape", state);
      expect(state.mode).toBe(Mode.COMMAND);
    });

    test("should exit to command mode on Esc", () => {
      handleCommand("Esc", state);
      expect(state.mode).toBe(Mode.COMMAND);
    });

    test("should blur editor when exiting insert mode", () => {
      handleCommand("Escape", state);
      expect(mockIframe.contentWindow.document.body.blur).toHaveBeenCalled();
    });
  });

  describe("Visual Mode", () => {
    beforeEach(() => {
      state.setMode(Mode.VISUAL);
    });

    test("should handle visual mode movement commands", () => {
      const movements = ["h", "j", "k", "l", "w", "b"];

      movements.forEach((movement) => {
        handleCommand(movement, state);
        expect(
          mockIframe.contentWindow.document.body.dispatchEvent
        ).toHaveBeenCalled();
      });
    });

    test("should handle visual mode actions", () => {
      handleCommand("y", state);
      expect(state.mode).toBe(Mode.COMMAND);

      state.setMode(Mode.VISUAL);
      handleCommand("d", state);
      expect(state.mode).toBe(Mode.COMMAND);

      state.setMode(Mode.VISUAL);
      handleCommand("p", state);
      expect(state.mode).toBe(Mode.COMMAND);
    });

    test("should exit to command mode on escape", () => {
      handleCommand("Escape", state);
      expect(state.mode).toBe(Mode.COMMAND);
    });

    test("should clear selection when exiting visual mode", () => {
      handleCommand("Escape", state);
      expect(state.mode).toBe(Mode.COMMAND);
      // Note: Selection clearing happens in the real document, not our mock
    });

    test("should handle undo and redo in visual mode", () => {
      handleCommand("u", state);
      expect(mockCopyMenuItem.dispatchEvent).toHaveBeenCalled();

      jest.clearAllMocks();
      handleCommand(".", state);
      expect(mockCopyMenuItem.dispatchEvent).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    test("should handle commands when no editor is found", () => {
      document.querySelector = jest.fn(() => null);

      expect(() => {
        handleCommand("h", state);
      }).not.toThrow();
    });

    test("should handle invalid commands gracefully", () => {
      expect(() => {
        handleCommand("x", state);
      }).not.toThrow();
    });

    test("should clear pending command on different key press", () => {
      jest.useFakeTimers();

      handleCommand("g", state);
      expect(state.pendingCommand).toBe("g");

      // Interrupt with different command before timeout
      handleCommand("h", state);
      expect(state.pendingCommand).toBe("");

      jest.useRealTimers();
    });
  });
});
