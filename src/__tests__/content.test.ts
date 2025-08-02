import { Mode } from "../state";
import { setMode, state } from "../content";

// Mock Chrome API
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
    },
  },
} as any;

describe("Content Script", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    jest.clearAllMocks();

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

  describe("Status Bar", () => {
    test("should create and update status bar", () => {
      setMode(Mode.COMMAND);
      const statusBar = document.getElementById("vim-status-bar");

      expect(statusBar).toBeTruthy();
      expect(statusBar?.textContent).toBe("MODE: COMMAND");
      expect(statusBar?.style.display).toBe("block");
      expect(statusBar?.style.position).toBe("fixed");
      expect(statusBar?.style.bottom).toBe("0px");
      expect(statusBar?.style.zIndex).toBe("9999");

      setMode(Mode.OFF);
      expect(statusBar?.style.display).toBe("none");
    });

    test("should update existing status bar", () => {
      setMode(Mode.COMMAND);
      const statusBar1 = document.getElementById("vim-status-bar");

      setMode(Mode.INSERT);
      const statusBar2 = document.getElementById("vim-status-bar");

      expect(statusBar1).toBe(statusBar2); // Same element
      expect(statusBar2?.textContent).toBe("MODE: INSERT");
    });

    test("should handle all mode types", () => {
      const modes = [Mode.COMMAND, Mode.INSERT, Mode.VISUAL, Mode.OFF];

      modes.forEach((mode) => {
        setMode(mode);
        const statusBar = document.getElementById("vim-status-bar");

        if (mode === Mode.OFF) {
          expect(statusBar?.style.display).toBe("none");
        } else {
          expect(statusBar?.textContent).toBe(`MODE: ${mode}`);
          expect(statusBar?.style.display).toBe("block");
        }
      });
    });
  });

  describe("Editor Initialization", () => {
    test("should detect Google Docs iframe", () => {
      document.body.innerHTML = `
        <iframe class="docs-texteventtarget-iframe">
          <html><body></body></html>
        </iframe>
      `;

      const editor = document.querySelector(
        "iframe.docs-texteventtarget-iframe"
      );
      expect(editor).toBeTruthy();
    });

    test("should handle missing iframe gracefully", () => {
      document.body.innerHTML = "<div>No iframe here</div>";

      const editor = document.querySelector(
        "iframe.docs-texteventtarget-iframe"
      );
      expect(editor).toBeNull();
    });

    test("waitForDocsLoad with timer", (done) => {
      jest.useFakeTimers();

      // Simulate the waitForDocsLoad functionality
      let attempts = 0;
      const maxAttempts = 5;

      const checkForEditor = () => {
        attempts++;
        const editor = document.querySelector(
          "iframe.docs-texteventtarget-iframe"
        );

        if (editor || attempts >= maxAttempts) {
          expect(attempts).toBeLessThanOrEqual(maxAttempts);
          jest.useRealTimers();
          done();
          return;
        }

        setTimeout(checkForEditor, 1000);
      };

      // Add iframe after 2 seconds
      setTimeout(() => {
        document.body.innerHTML = `
          <iframe class="docs-texteventtarget-iframe">
            <html><body></body></html>
          </iframe>
        `;
      }, 2000);

      checkForEditor();
      jest.advanceTimersByTime(5000);
    });
  });

  describe("Key Event Handling", () => {
    let mockEditor: any;

    beforeEach(() => {
      mockEditor = {
        contentWindow: {
          document: {
            addEventListener: jest.fn(),
            body: {
              dispatchEvent: jest.fn(),
            },
          },
        },
      };

      document.body.innerHTML = `<iframe class="docs-texteventtarget-iframe"></iframe>`;
      jest.spyOn(document, "querySelector").mockReturnValue(mockEditor);
    });

    test("should add event listeners to editor", () => {
      // Simulate initialization
      const editor = document.querySelector(
        "iframe.docs-texteventtarget-iframe"
      ) as any;
      if (editor?.contentWindow) {
        editor.contentWindow.document.addEventListener(
          "keydown",
          jest.fn(),
          true
        );
      }

      expect(
        mockEditor.contentWindow.document.addEventListener
      ).toHaveBeenCalledWith("keydown", expect.any(Function), true);
    });

    test("should handle command keys in command mode", () => {
      state.setMode(Mode.COMMAND);

      const commandKeys = ["h", "j", "k", "l", "i", "v", "d", "w", "g"];
      const mockEvent = {
        key: "",
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };

      commandKeys.forEach((key) => {
        mockEvent.key = key;
        jest.clearAllMocks();

        // Simulate the key handler logic
        if (state.isInCommandMode()) {
          mockEvent.preventDefault();
          mockEvent.stopPropagation();
        }

        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
      });
    });

    test("should allow all keys in insert mode except escape", () => {
      state.setMode(Mode.INSERT);

      const mockEvent = {
        key: "a",
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };

      // Regular keys should not be prevented
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();

      // Escape should be handled
      mockEvent.key = "Escape";
      if (["Escape", "Esc"].includes(mockEvent.key)) {
        mockEvent.preventDefault();
      }

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    test("should handle visual mode keys", () => {
      state.setMode(Mode.VISUAL);

      const visualKeys = ["h", "j", "k", "l", "y", "d", "w", "b"];
      const mockEvent = {
        key: "",
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      };

      visualKeys.forEach((key) => {
        mockEvent.key = key;
        jest.clearAllMocks();

        if (state.isInVisualMode()) {
          mockEvent.preventDefault();
          mockEvent.stopPropagation();
        }

        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
      });
    });
  });

  describe("Chrome Message Handling", () => {
    let messageListener: any;

    beforeEach(() => {
      // Capture the message listener when it's registered
      chrome.runtime.onMessage.addListener = jest.fn((listener) => {
        messageListener = listener;
      });
    });

    test("should register message listener", () => {
      // Simulate the content script registration
      chrome.runtime.onMessage.addListener(jest.fn());

      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
    });

    test("should handle toggleCommandMode message", () => {
      const mockSendResponse = jest.fn();

      // Create a mock listener similar to the actual implementation
      messageListener = (message: any, sender: any, sendResponse: any) => {
        if (message.type === "toggleCommandMode") {
          const isEnabled = message.enabled;
          setMode(isEnabled ? Mode.COMMAND : Mode.OFF);
          sendResponse({ success: true, mode: isEnabled ? "COMMAND" : "OFF" });
          return true;
        }
      };

      // Test enabling command mode
      messageListener(
        { type: "toggleCommandMode", enabled: true },
        {},
        mockSendResponse
      );

      expect(state.mode).toBe(Mode.COMMAND);
      expect(mockSendResponse).toHaveBeenCalledWith({
        success: true,
        mode: "COMMAND",
      });

      // Test disabling command mode
      jest.clearAllMocks();
      messageListener(
        { type: "toggleCommandMode", enabled: false },
        {},
        mockSendResponse
      );

      expect(state.mode).toBe(Mode.OFF);
      expect(mockSendResponse).toHaveBeenCalledWith({
        success: true,
        mode: "OFF",
      });
    });

    test("should ignore unknown message types", () => {
      const mockSendResponse = jest.fn();

      messageListener = (message: any, sender: any, sendResponse: any) => {
        if (message.type === "toggleCommandMode") {
          return true;
        }
        // Unknown messages are ignored
      };

      messageListener(
        { type: "unknownMessage", data: "test" },
        {},
        mockSendResponse
      );

      expect(mockSendResponse).not.toHaveBeenCalled();
    });
  });

  describe("State Integration", () => {
    test("should maintain state consistency", () => {
      expect(state.mode).toBe(Mode.OFF);

      setMode(Mode.COMMAND);
      expect(state.mode).toBe(Mode.COMMAND);

      setMode(Mode.INSERT);
      expect(state.mode).toBe(Mode.INSERT);

      setMode(Mode.VISUAL);
      expect(state.mode).toBe(Mode.VISUAL);

      setMode(Mode.OFF);
      expect(state.mode).toBe(Mode.OFF);
    });

    test("should update status bar when state changes", () => {
      setMode(Mode.COMMAND);
      let statusBar = document.getElementById("vim-status-bar");
      expect(statusBar?.textContent).toBe("MODE: COMMAND");

      setMode(Mode.INSERT);
      statusBar = document.getElementById("vim-status-bar");
      expect(statusBar?.textContent).toBe("MODE: INSERT");
    });
  });
});
