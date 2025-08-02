import { Mode, VimState } from "../state";

describe("VimState", () => {
  let state: VimState;

  beforeEach(() => {
    state = new VimState();
    // Mock DOM element
    document.body.innerHTML = '<div id="vim-status-bar"></div>';

    // Mock console to suppress debug logs during tests
    jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Clean up status bar
    const statusBar = document.getElementById("vim-status-bar");
    if (statusBar) {
      statusBar.remove();
    }
  });

  describe("Initial State", () => {
    test("should initialize in OFF mode", () => {
      expect(state.mode).toBe(Mode.OFF);
      expect(state.isInOffMode()).toBe(true);
      expect(state.isInCommandMode()).toBe(false);
      expect(state.isInInsertMode()).toBe(false);
      expect(state.isInVisualMode()).toBe(false);
    });

    test("should initialize with empty clipboard", () => {
      expect(state.getClipboard()).toBe("");
    });

    test("should initialize with empty commands", () => {
      expect(state.pendingCommand).toBe("");
      expect(state.lastCommand).toBe("");
    });
  });

  describe("Mode Changes", () => {
    test("should change to COMMAND mode correctly", () => {
      state.setMode(Mode.COMMAND);
      expect(state.mode).toBe(Mode.COMMAND);
      expect(state.isInCommandMode()).toBe(true);
      expect(state.isInOffMode()).toBe(false);
      expect(state.isInInsertMode()).toBe(false);
      expect(state.isInVisualMode()).toBe(false);
    });

    test("should change to INSERT mode correctly", () => {
      state.setMode(Mode.INSERT);
      expect(state.mode).toBe(Mode.INSERT);
      expect(state.isInInsertMode()).toBe(true);
      expect(state.isInOffMode()).toBe(false);
      expect(state.isInCommandMode()).toBe(false);
      expect(state.isInVisualMode()).toBe(false);
    });

    test("should change to VISUAL mode correctly", () => {
      state.setMode(Mode.VISUAL);
      expect(state.mode).toBe(Mode.VISUAL);
      expect(state.isInVisualMode()).toBe(true);
      expect(state.isInOffMode()).toBe(false);
      expect(state.isInCommandMode()).toBe(false);
      expect(state.isInInsertMode()).toBe(false);
    });

    test("should change back to OFF mode correctly", () => {
      state.setMode(Mode.COMMAND);
      state.setMode(Mode.OFF);
      expect(state.mode).toBe(Mode.OFF);
      expect(state.isInOffMode()).toBe(true);
      expect(state.isInCommandMode()).toBe(false);
      expect(state.isInInsertMode()).toBe(false);
      expect(state.isInVisualMode()).toBe(false);
    });

    test("should handle mode transitions", () => {
      // Test various mode transitions
      const transitions = [
        Mode.COMMAND,
        Mode.INSERT,
        Mode.VISUAL,
        Mode.OFF,
        Mode.COMMAND,
        Mode.VISUAL,
        Mode.INSERT,
        Mode.OFF,
      ];

      transitions.forEach((mode) => {
        state.setMode(mode);
        expect(state.mode).toBe(mode);
      });
    });
  });

  describe("Status Bar Updates", () => {
    test("should update status bar when mode changes", () => {
      state.setMode(Mode.COMMAND);
      const statusBar = document.getElementById("vim-status-bar");
      expect(statusBar?.textContent).toBe("MODE: COMMAND");

      state.setMode(Mode.INSERT);
      expect(statusBar?.textContent).toBe("MODE: INSERT");

      state.setMode(Mode.VISUAL);
      expect(statusBar?.textContent).toBe("MODE: VISUAL");

      state.setMode(Mode.OFF);
      expect(statusBar?.textContent).toBe("MODE: OFF");
    });

    test("should handle missing status bar gracefully", () => {
      document.body.innerHTML = ""; // Remove status bar

      expect(() => {
        state.setMode(Mode.COMMAND);
      }).not.toThrow();
    });

    test("should update existing status bar", () => {
      state.setMode(Mode.COMMAND);
      const statusBar1 = document.getElementById("vim-status-bar");

      state.setMode(Mode.INSERT);
      const statusBar2 = document.getElementById("vim-status-bar");

      expect(statusBar1).toBe(statusBar2); // Same element
      expect(statusBar2?.textContent).toBe("MODE: INSERT");
    });
  });

  describe("Clipboard Operations", () => {
    test("should handle clipboard operations", () => {
      const testText = "Hello World";
      state.setClipboard(testText);
      expect(state.getClipboard()).toBe(testText);
    });

    test("should handle empty clipboard", () => {
      state.setClipboard("");
      expect(state.getClipboard()).toBe("");
    });

    test("should handle special characters in clipboard", () => {
      const specialText = "Hello\nWorld\t!@#$%^&*()";
      state.setClipboard(specialText);
      expect(state.getClipboard()).toBe(specialText);
    });

    test("should handle unicode in clipboard", () => {
      const unicodeText = "Hello 🌍 Ñiño café";
      state.setClipboard(unicodeText);
      expect(state.getClipboard()).toBe(unicodeText);
    });

    test("should overwrite previous clipboard content", () => {
      state.setClipboard("First");
      expect(state.getClipboard()).toBe("First");

      state.setClipboard("Second");
      expect(state.getClipboard()).toBe("Second");
    });
  });

  describe("Command Operations", () => {
    test("should handle pending command operations", () => {
      const command = "dd";
      state.setPendingCommand(command);
      expect(state.pendingCommand).toBe(command);

      state.setPendingCommand("");
      expect(state.pendingCommand).toBe("");
    });

    test("should handle last command operations", () => {
      const command = "yy";
      state.setLastCommand(command);
      expect(state.lastCommand).toBe(command);

      state.setLastCommand("");
      expect(state.lastCommand).toBe("");
    });

    test("should handle single character commands", () => {
      const commands = ["h", "j", "k", "l", "i", "v", "d", "y", "p"];

      commands.forEach((cmd) => {
        state.setPendingCommand(cmd);
        expect(state.pendingCommand).toBe(cmd);

        state.setLastCommand(cmd);
        expect(state.lastCommand).toBe(cmd);
      });
    });

    test("should handle double character commands", () => {
      const commands = ["gg", "dd", "yy", ":q"];

      commands.forEach((cmd) => {
        state.setPendingCommand(cmd);
        expect(state.pendingCommand).toBe(cmd);

        state.setLastCommand(cmd);
        expect(state.lastCommand).toBe(cmd);
      });
    });

    test("should handle command overwriting", () => {
      state.setPendingCommand("g");
      expect(state.pendingCommand).toBe("g");

      state.setPendingCommand("gg");
      expect(state.pendingCommand).toBe("gg");

      state.setLastCommand("d");
      expect(state.lastCommand).toBe("d");

      state.setLastCommand("dd");
      expect(state.lastCommand).toBe("dd");
    });

    test("should maintain independent command states", () => {
      state.setPendingCommand("g");
      state.setLastCommand("y");

      expect(state.pendingCommand).toBe("g");
      expect(state.lastCommand).toBe("y");

      state.setPendingCommand("");
      expect(state.pendingCommand).toBe("");
      expect(state.lastCommand).toBe("y"); // Should remain unchanged
    });
  });

  describe("State Consistency", () => {
    test("should maintain consistent state across operations", () => {
      // Set initial state
      state.setMode(Mode.COMMAND);
      state.setClipboard("test content");
      state.setPendingCommand("g");
      state.setLastCommand("d");

      // Verify all properties
      expect(state.mode).toBe(Mode.COMMAND);
      expect(state.getClipboard()).toBe("test content");
      expect(state.pendingCommand).toBe("g");
      expect(state.lastCommand).toBe("d");

      // Change mode and verify other properties persist
      state.setMode(Mode.INSERT);
      expect(state.mode).toBe(Mode.INSERT);
      expect(state.getClipboard()).toBe("test content");
      expect(state.pendingCommand).toBe("g");
      expect(state.lastCommand).toBe("d");
    });

    test("should handle rapid state changes", () => {
      for (let i = 0; i < 100; i++) {
        const modes = [Mode.OFF, Mode.COMMAND, Mode.INSERT, Mode.VISUAL];
        const randomMode = modes[i % modes.length];

        state.setMode(randomMode);
        expect(state.mode).toBe(randomMode);
      }
    });
  });

  describe("Mode Enum Values", () => {
    test("should have correct enum values", () => {
      expect(Mode.OFF).toBe("OFF");
      expect(Mode.COMMAND).toBe("COMMAND");
      expect(Mode.INSERT).toBe("INSERT");
      expect(Mode.VISUAL).toBe("VISUAL");
    });

    test("should work with all enum values", () => {
      Object.values(Mode).forEach((mode) => {
        state.setMode(mode as Mode);
        expect(state.mode).toBe(mode);
      });
    });
  });

  describe("Error Handling", () => {
    test("should handle null clipboard gracefully", () => {
      expect(() => {
        state.setClipboard(null as any);
      }).not.toThrow();
    });

    test("should handle undefined commands gracefully", () => {
      expect(() => {
        state.setPendingCommand(undefined as any);
        state.setLastCommand(undefined as any);
      }).not.toThrow();
    });

    test("should handle invalid mode gracefully", () => {
      expect(() => {
        state.setMode("INVALID" as any);
      }).not.toThrow();
    });
  });
});
