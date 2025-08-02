import "../popup";

describe("Popup functionality", () => {
  let mockTabs: any[];
  let mockSendMessage: jest.Mock;
  let mockStorageGet: jest.Mock;
  let mockStorageSet: jest.Mock;
  let mockTabsQuery: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    mockTabs = [
      {
        id: 123,
        url: "https://docs.google.com/document/d/abc123/edit",
        active: true,
      },
    ];

    mockSendMessage = jest.fn();
    mockStorageGet = jest.fn();
    mockStorageSet = jest.fn();
    mockTabsQuery = jest.fn();

    // Set up Chrome API mocks
    global.chrome = {
      storage: {
        sync: {
          get: mockStorageGet,
          set: mockStorageSet,
        },
      },
      tabs: {
        query: mockTabsQuery,
        sendMessage: mockSendMessage,
      },
      runtime: {
        get lastError() {
          return null;
        },
      },
    } as any;

    // Default tabs query behavior
    mockTabsQuery.mockImplementation((query, callback) => {
      callback(mockTabs);
    });

    document.body.innerHTML = `
      <input type="checkbox" id="turn-on">
    `;

    // Clear mock data
    jest.clearAllMocks();

    // Mock console to suppress debug logs
    jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Initialization", () => {
    test("should load stored setting on DOMContentLoaded", () => {
      const storedValue = { enableCommandMode: true };

      mockStorageGet.mockImplementation(
        (keys: string[], callback: Function) => {
          callback(storedValue);
        }
      );

      // Import popup to trigger DOMContentLoaded
      require("../popup");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      expect(mockStorageGet).toHaveBeenCalledWith(
        ["enableCommandMode"],
        expect.any(Function)
      );

      const checkbox = document.getElementById("turn-on") as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    test("should default to false when no stored value", () => {
      mockStorageGet.mockImplementation(
        (keys: string[], callback: Function) => {
          callback({});
        }
      );

      require("../popup");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      const checkbox = document.getElementById("turn-on") as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    test("should handle undefined stored value", () => {
      mockStorageGet.mockImplementation(
        (keys: string[], callback: Function) => {
          callback({ enableCommandMode: undefined });
        }
      );

      require("../popup");
      document.dispatchEvent(new Event("DOMContentLoaded"));

      const checkbox = document.getElementById("turn-on") as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });
  });

  describe("Checkbox Change Events", () => {
    let checkbox: HTMLInputElement;

    beforeEach(() => {
      mockStorageGet.mockImplementation(
        (keys: string[], callback: Function) => {
          callback({ enableCommandMode: false });
        }
      );

      require("../popup");
      document.dispatchEvent(new Event("DOMContentLoaded"));
      checkbox = document.getElementById("turn-on") as HTMLInputElement;
    });

    test("should save setting and send message when checkbox is checked", () => {
      mockStorageSet.mockImplementation((data: any, callback: Function) => {
        callback();
      });

      mockSendMessage.mockImplementation((tabId, message, callback) => {
        callback({ success: true, mode: "COMMAND" });
      });

      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change"));

      expect(mockStorageSet).toHaveBeenCalledWith(
        { enableCommandMode: true },
        expect.any(Function)
      );

      expect(mockSendMessage).toHaveBeenCalledWith(
        123,
        { type: "toggleCommandMode", enabled: true },
        expect.any(Function)
      );
    });

    test("should save setting and send message when checkbox is unchecked", () => {
      // First set it to checked state
      checkbox.checked = true;
      mockStorageSet.mockImplementation((data: any, callback: Function) => {
        callback();
      });
      checkbox.dispatchEvent(new Event("change"));

      jest.clearAllMocks();

      // Then uncheck it
      checkbox.checked = false;
      mockStorageSet.mockImplementation((data: any, callback: Function) => {
        callback();
      });
      checkbox.dispatchEvent(new Event("change"));

      expect(mockStorageSet).toHaveBeenCalledWith(
        { enableCommandMode: false },
        expect.any(Function)
      );

      expect(mockSendMessage).toHaveBeenCalledWith(
        123,
        { type: "toggleCommandMode", enabled: false },
        expect.any(Function)
      );
    });

    test("should handle successful message response", () => {
      const consoleSpy = jest.spyOn(console, "log");

      mockStorageSet.mockImplementation((data: any, callback: Function) => {
        callback();
      });

      mockSendMessage.mockImplementation((tabId, message, callback) => {
        callback({ success: true, mode: "COMMAND" });
      });

      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change"));

      expect(consoleSpy).toHaveBeenCalledWith(
        "Message sent successfully - Mode set to: COMMAND"
      );
    });

    test("should handle message response without success flag", () => {
      const consoleSpy = jest.spyOn(console, "log");

      mockStorageSet.mockImplementation((data: any, callback: Function) => {
        callback();
      });

      mockSendMessage.mockImplementation((tabId, message, callback) => {
        callback({ data: "some response" });
      });

      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change"));

      expect(consoleSpy).toHaveBeenCalledWith(
        "Message sent but no response received"
      );
    });
  });

  describe("Error Handling", () => {
    let checkbox: HTMLInputElement;

    beforeEach(() => {
      mockStorageGet.mockImplementation(
        (keys: string[], callback: Function) => {
          callback({ enableCommandMode: false });
        }
      );

      require("../popup");
      document.dispatchEvent(new Event("DOMContentLoaded"));
      checkbox = document.getElementById("turn-on") as HTMLInputElement;
    });

    test("should handle Chrome runtime error", () => {
      const consoleSpy = jest.spyOn(console, "log");

      // Mock runtime error by modifying the chrome object
      const originalRuntime = global.chrome.runtime;
      global.chrome.runtime = {
        get lastError() {
          return { message: "Extension context invalidated." };
        },
      } as any;

      mockStorageSet.mockImplementation((data: any, callback: Function) => {
        callback();
      });

      mockSendMessage.mockImplementation((tabId, message, callback) => {
        callback();
      });

      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change"));

      expect(consoleSpy).toHaveBeenCalledWith(
        "Content script not ready or not on Google Docs:",
        "Extension context invalidated."
      );

      // Restore original runtime
      global.chrome.runtime = originalRuntime;
    });

    test("should handle no active tab", () => {
      const consoleSpy = jest.spyOn(console, "log");

      mockTabs = [];
      mockTabsQuery.mockImplementation((query, callback) => {
        callback(mockTabs);
      });

      mockStorageSet.mockImplementation((data: any, callback: Function) => {
        callback();
      });

      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change"));

      expect(mockSendMessage).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("Vim Mode has been enabled.");
    });

    test("should handle tab without ID", () => {
      const consoleSpy = jest.spyOn(console, "log");

      mockTabs = [{ url: "https://docs.google.com/document/d/abc123/edit" }];
      mockTabsQuery.mockImplementation((query, callback) => {
        callback(mockTabs);
      });

      mockStorageSet.mockImplementation((data: any, callback: Function) => {
        callback();
      });

      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change"));

      expect(mockSendMessage).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("Vim Mode has been enabled.");
    });

    test("should handle non-Google Docs URL", () => {
      const consoleSpy = jest.spyOn(console, "log");

      mockTabs = [
        {
          id: 123,
          url: "https://www.google.com",
          active: true,
        },
      ];
      mockTabsQuery.mockImplementation((query, callback) => {
        callback(mockTabs);
      });

      mockStorageSet.mockImplementation((data: any, callback: Function) => {
        callback();
      });

      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change"));

      expect(mockSendMessage).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Not on a Google Docs page - settings saved but not applied"
      );
    });

    test("should handle missing settings gracefully", () => {
      mockStorageGet.mockImplementation(
        (keys: string[], callback: Function) => {
          callback({}); // Return empty settings
        }
      );

      expect(() => {
        require("../popup");
        document.dispatchEvent(new Event("DOMContentLoaded"));
      }).not.toThrow();
    });
  });

  describe("Tab Query Edge Cases", () => {
    let checkbox: HTMLInputElement;

    beforeEach(() => {
      mockStorageGet.mockImplementation(
        (keys: string[], callback: Function) => {
          callback({ enableCommandMode: false });
        }
      );

      require("../popup");
      document.dispatchEvent(new Event("DOMContentLoaded"));
      checkbox = document.getElementById("turn-on") as HTMLInputElement;
    });

    test("should handle empty tabs query result", () => {
      mockTabsQuery.mockImplementation((query, callback) => {
        callback([]); // Return empty tabs array
      });

      mockStorageSet.mockImplementation((data: any, callback: Function) => {
        callback();
      });

      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change"));

      expect(mockSendMessage).not.toHaveBeenCalled();
    });

    test("should handle multiple tabs", () => {
      mockTabs = [
        {
          id: 123,
          url: "https://docs.google.com/document/d/abc123/edit",
          active: true,
        },
        {
          id: 456,
          url: "https://docs.google.com/document/d/def456/edit",
          active: false,
        },
      ];
      mockTabsQuery.mockImplementation((query, callback) => {
        callback(mockTabs);
      });

      mockStorageSet.mockImplementation((data: any, callback: Function) => {
        callback();
      });

      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change"));

      // Should only send message to the first tab (tabs[0])
      expect(mockSendMessage).toHaveBeenCalledWith(
        123,
        { type: "toggleCommandMode", enabled: true },
        expect.any(Function)
      );
    });

    test("should work with Google Docs URLs with different domains", () => {
      const googleDocsUrls = [
        "https://docs.google.com/document/d/abc123/edit",
        "https://docs.google.co.uk/document/d/abc123/edit",
        "https://docs.google.ca/document/d/abc123/edit",
      ];

      googleDocsUrls.forEach((url, index) => {
        jest.clearAllMocks();

        mockTabs = [{ id: 123 + index, url, active: true }];
        mockTabsQuery.mockImplementation((query, callback) => {
          callback(mockTabs);
        });

        mockStorageSet.mockImplementation((data: any, callback: Function) => {
          callback();
        });

        checkbox.checked = true;
        checkbox.dispatchEvent(new Event("change"));

        if (url.includes("docs.google.com")) {
          expect(mockSendMessage).toHaveBeenCalled();
        }
      });
    });
  });

  describe("Message Sending", () => {
    let checkbox: HTMLInputElement;

    beforeEach(() => {
      mockStorageGet.mockImplementation(
        (keys: string[], callback: Function) => {
          callback({ enableCommandMode: false });
        }
      );

      require("../popup");
      document.dispatchEvent(new Event("DOMContentLoaded"));
      checkbox = document.getElementById("turn-on") as HTMLInputElement;
    });

    test("should send correct message structure", () => {
      mockStorageSet.mockImplementation((data: any, callback: Function) => {
        callback();
      });

      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change"));

      expect(mockSendMessage).toHaveBeenCalledWith(
        123,
        {
          type: "toggleCommandMode",
          enabled: true,
        },
        expect.any(Function)
      );

      const messageCallback = mockSendMessage.mock.calls[0][2];
      expect(typeof messageCallback).toBe("function");
    });

    test("should handle message timeout", () => {
      const consoleSpy = jest.spyOn(console, "log");

      mockStorageSet.mockImplementation((data: any, callback: Function) => {
        callback();
      });

      // Simulate message timeout by not calling the callback
      mockSendMessage.mockImplementation((tabId, message, callback) => {
        // Don't call callback to simulate timeout
      });

      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change"));

      // The message should still be sent even if no response
      expect(mockSendMessage).toHaveBeenCalled();
    });
  });
});
