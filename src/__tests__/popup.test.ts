import "../popup";

describe("Popup functionality", () => {
  let changeHandler: (event: Event) => void;

  beforeEach(() => {
    // Set up Chrome API mocks
    global.chrome = {
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

    document.body.innerHTML = `
      <input type="checkbox" id="turn-on">
    `;

    // Clear mock data
    jest.clearAllMocks();

    // Save the event handler when it's attached
    const originalAddEventListener = document.addEventListener;
    document.addEventListener = jest.fn((event, handler) => {
      if (event === "DOMContentLoaded") {
        changeHandler = handler as (event: Event) => void;
      }
      return originalAddEventListener.call(document, event, handler);
    });

    // Trigger the DOMContentLoaded handler manually
    changeHandler?.(new Event("DOMContentLoaded"));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("checkbox should initialize with stored value", () => {
    const storedValue = { enableCommandMode: true };

    (chrome.storage.sync.get as jest.Mock).mockImplementation(
      (
        _keys: string[],
        callback: (result: { enableCommandMode: boolean }) => void
      ) => {
        callback(storedValue);
      }
    );

    document.dispatchEvent(new Event("DOMContentLoaded"));

    const checkbox = document.getElementById("turn-on") as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  test("checkbox should default to false when no stored value", () => {
    (chrome.storage.sync.get as jest.Mock).mockImplementation(
      (
        _keys: string[],
        callback: (result: { enableCommandMode?: boolean }) => void
      ) => {
        callback({});
      }
    );

    document.dispatchEvent(new Event("DOMContentLoaded"));

    const checkbox = document.getElementById("turn-on") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  test("should handle storage errors", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    (chrome.storage.sync.get as jest.Mock).mockImplementation(
      (_keys: string[], callback: (result: any) => void) => {
        callback({ enableCommandMode: undefined });
      }
    );

    document.dispatchEvent(new Event("DOMContentLoaded"));

    const checkbox = document.getElementById("turn-on") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    consoleSpy.mockRestore();
  });
});
