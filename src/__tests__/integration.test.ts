import { Mode, VimState } from "../state";
import { handleCommand } from "../commands";

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

// Mock Google Docs menu items
const mockCopyMenuItem = {
  click: jest.fn(),
};

const mockUndoButton = {
  dispatchEvent: jest.fn(),
};

const mockRedoButton = {
  dispatchEvent: jest.fn(),
};

// Mock Chrome APIs
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
    },
  },
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn(),
  },
} as any;

// Mock navigator.clipboard
Object.defineProperty(navigator, "clipboard", {
  value: {
    readText: jest.fn(),
    writeText: jest.fn(),
  },
  writable: true,
});

// Mock navigator.userAgent for cross-platform testing
Object.defineProperty(navigator, "userAgent", {
  value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  writable: true,
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
    return mockUndoButton as any;
  }
  if (selector.includes('data-tooltip="Redo')) {
    return mockRedoButton as any;
  }
  return originalQuerySelector.call(document, selector);
});

describe("VIMrly Integration Tests", () => {
  let state: VimState;

  beforeEach(() => {
    state = new VimState();

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
    // Clean up status bar
    const statusBar = document.getElementById("vim-status-bar");
    if (statusBar) {
      statusBar.remove();
    }
  });

  describe("Full Workflow Tests", () => {
    test("should handle complete editing workflow", () => {
      // Start in OFF mode
      expect(state.mode).toBe(Mode.OFF);

      // Activate command mode
      state.setMode(Mode.COMMAND);
      expect(state.mode).toBe(Mode.COMMAND);

      // Navigate around
      handleCommand("h", state);
      handleCommand("j", state);
      handleCommand("k", state);
      handleCommand("l", state);
      expect(
        mockIframe.contentWindow.document.body.dispatchEvent
      ).toHaveBeenCalledTimes(4);

      // Go to insert mode, type, then back to command
      handleCommand("i", state);
      expect(state.mode).toBe(Mode.INSERT);

      handleCommand("Escape", state);
      expect(state.mode).toBe(Mode.COMMAND);

      // Copy a line
      handleCommand("y", state);
      handleCommand("y", state);
      expect(state.pendingCommand).toBe("");
      expect(state.lastCommand).toBe("y");

      // Paste
      handleCommand("p", state);
      expect(navigator.clipboard.readText).toHaveBeenCalled();

      // Delete a line
      handleCommand("d", state);
      handleCommand("d", state);
      expect(state.pendingCommand).toBe("");
      expect(state.lastCommand).toBe("d");

      // Undo
      handleCommand("u", state);
      expect(mockUndoButton.dispatchEvent).toHaveBeenCalled();
    });

    test("should handle visual mode workflow", () => {
      state.setMode(Mode.COMMAND);

      // Enter visual mode
      handleCommand("v", state);
      expect(state.mode).toBe(Mode.VISUAL);

      // Select text with movement
      handleCommand("l", state);
      handleCommand("l", state);
      handleCommand("w", state);
      expect(
        mockIframe.contentWindow.document.body.dispatchEvent
      ).toHaveBeenCalledTimes(3);

      // Copy selection
      handleCommand("y", state);
      expect(state.mode).toBe(Mode.COMMAND);

      // Enter visual mode again
      handleCommand("v", state);
      expect(state.mode).toBe(Mode.VISUAL);

      // Delete selection
      handleCommand("d", state);
      expect(state.mode).toBe(Mode.COMMAND);
    });

    test("should handle document navigation workflow", () => {
      state.setMode(Mode.COMMAND);

      // Go to document start
      handleCommand("g", state);
      handleCommand("g", state);
      expect(
        mockIframe.contentWindow.document.body.dispatchEvent
      ).toHaveBeenCalled();

      // Go to document end
      handleCommand("G", state);
      expect(
        mockIframe.contentWindow.document.body.dispatchEvent
      ).toHaveBeenCalled();

      // Line movements
      handleCommand("0", state);
      handleCommand("$", state);
      expect(
        mockIframe.contentWindow.document.body.dispatchEvent
      ).toHaveBeenCalledTimes(4);
    });
  });

  describe("Command Chaining and Timeouts", () => {
    test("should handle command timeout properly", (done) => {
      state.setMode(Mode.COMMAND);

      // Start a potential double command
      handleCommand("g", state);
      expect(state.pendingCommand).toBe("g");

      // Wait for timeout
      setTimeout(() => {
        expect(state.pendingCommand).toBe("");
        done();
      }, 600);
    });

    test("should handle rapid command sequences", () => {
      state.setMode(Mode.COMMAND);

      // Rapid navigation
      const commands = ["h", "j", "k", "l", "w", "b", "0", "$"];
      commands.forEach((cmd) => {
        handleCommand(cmd, state);
      });

      expect(
        mockIframe.contentWindow.document.body.dispatchEvent
      ).toHaveBeenCalledTimes(commands.length);
    });

    test("should handle interrupted double commands", () => {
      state.setMode(Mode.COMMAND);

      // Start double command
      handleCommand("g", state);
      expect(state.pendingCommand).toBe("g");

      // Interrupt with different command
      handleCommand("h", state);
      expect(state.pendingCommand).toBe("");
      expect(state.lastCommand).toBe("h");
    });
  });

  describe("Cross-Platform Compatibility", () => {
    test("should use correct key combinations on macOS", () => {
      // Ensure we're testing macOS
      Object.defineProperty(navigator, "userAgent", {
        value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        writable: true,
      });

      state.setMode(Mode.COMMAND);

      // Test word movement (should use Option key on macOS)
      handleCommand("w", state);
      const wordMoveCall =
        mockIframe.contentWindow.document.body.dispatchEvent.mock.calls.find(
          (call) => call[0].altKey === true && call[0].key === "ArrowRight"
        );
      expect(wordMoveCall).toBeTruthy();

      // Test document movement (should use Cmd key on macOS)
      handleCommand("g", state);
      handleCommand("g", state);
      const docMoveCall =
        mockIframe.contentWindow.document.body.dispatchEvent.mock.calls.find(
          (call) => call[0].metaKey === true && call[0].key === "ArrowUp"
        );
      expect(docMoveCall).toBeTruthy();
    });

    test("should use correct key combinations on Windows/Linux", () => {
      // Mock Windows user agent
      Object.defineProperty(navigator, "userAgent", {
        value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        writable: true,
      });

      state.setMode(Mode.COMMAND);

      // Test word movement (should use Ctrl key on Windows)
      handleCommand("w", state);
      const wordMoveCall =
        mockIframe.contentWindow.document.body.dispatchEvent.mock.calls.find(
          (call) => call[0].ctrlKey === true && call[0].key === "ArrowRight"
        );
      expect(wordMoveCall).toBeTruthy();

      // Test document movement (should use Ctrl key on Windows)
      handleCommand("g", state);
      handleCommand("g", state);
      const docMoveCall =
        mockIframe.contentWindow.document.body.dispatchEvent.mock.calls.find(
          (call) => call[0].ctrlKey === true && call[0].key === "Home"
        );
      expect(docMoveCall).toBeTruthy();
    });
  });

  describe("Error Recovery", () => {
    test("should recover from missing editor", () => {
      document.querySelector = jest.fn(() => null);
      state.setMode(Mode.COMMAND);

      expect(() => {
        handleCommand("h", state);
        handleCommand("j", state);
        handleCommand("k", state);
      }).not.toThrow();
    });

    test("should handle missing menu items gracefully", () => {
      document.querySelector = jest.fn((selector) => {
        if (selector === "iframe.docs-texteventtarget-iframe") {
          return mockIframe as any;
        }
        return null; // No menu items found
      });

      state.setMode(Mode.COMMAND);

      expect(() => {
        handleCommand("y", state);
        handleCommand("y", state);
      }).not.toThrow();

      expect(() => {
        handleCommand("u", state);
        handleCommand(".", state);
      }).not.toThrow();
    });

    test("should handle clipboard errors gracefully", () => {
      (navigator.clipboard.readText as jest.Mock).mockRejectedValue(
        new Error("Clipboard access denied")
      );

      state.setMode(Mode.COMMAND);

      expect(() => {
        handleCommand("p", state);
      }).not.toThrow();
    });
  });

  describe("State Persistence", () => {
    test("should maintain clipboard across mode changes", () => {
      state.setMode(Mode.COMMAND);
      state.setClipboard("test content");

      // Change modes multiple times
      state.setMode(Mode.INSERT);
      state.setMode(Mode.VISUAL);
      state.setMode(Mode.COMMAND);
      state.setMode(Mode.OFF);

      // Clipboard should persist
      expect(state.getClipboard()).toBe("test content");
    });

    test("should maintain command history across operations", () => {
      state.setMode(Mode.COMMAND);

      // Execute several commands
      handleCommand("h", state);
      expect(state.lastCommand).toBe("h");

      handleCommand("j", state);
      expect(state.lastCommand).toBe("j");

      // Change mode and back
      state.setMode(Mode.INSERT);
      state.setMode(Mode.COMMAND);

      // Last command should still be remembered
      expect(state.lastCommand).toBe("j");
    });
  });

  describe("Extension Lifecycle", () => {
    test("should handle extension activation/deactivation", () => {
      // Start inactive
      expect(state.mode).toBe(Mode.OFF);

      // Activate
      state.setMode(Mode.COMMAND);
      expect(state.mode).toBe(Mode.COMMAND);

      // Use features
      handleCommand("h", state);
      handleCommand("j", state);

      // Deactivate
      handleCommand(":", state);
      handleCommand("q", state);
      expect(state.mode).toBe(Mode.OFF);
    });

    test("should handle rapid activation/deactivation", () => {
      for (let i = 0; i < 10; i++) {
        state.setMode(Mode.COMMAND);
        expect(state.mode).toBe(Mode.COMMAND);

        state.setMode(Mode.OFF);
        expect(state.mode).toBe(Mode.OFF);
      }
    });
  });
});
