import "../popup";

describe("Popup functionality", () => {
  beforeEach(() => {
    document.body.innerHTML = `
        <input type="checkbox" id="turn-on">
      `;
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

  test("changing checkbox should update storage and send message", () => {
    const checkbox = document.getElementById("turn-on") as HTMLInputElement;

    // Mock tabs.query with all required Tab properties
    (chrome.tabs.query as jest.Mock).mockImplementation(
      (
        _queryInfo: chrome.tabs.QueryInfo,
        callback: (tabs: chrome.tabs.Tab[]) => void
      ) => {
        callback([
          {
            id: 1,
            index: 0,
            pinned: false,
            highlighted: false,
            windowId: 1,
            active: true,
            incognito: false,
            selected: false,
            discarded: false,
            autoDiscardable: true,
            groupId: -1,
            url: "https://example.com",
            title: "Test Tab",
          },
        ]);
      }
    );

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change"));

    expect(chrome.storage.sync.set).toHaveBeenCalledWith(
      { enableCommandMode: true },
      expect.any(Function)
    );

    expect(chrome.tabs.query).toHaveBeenCalledWith(
      { active: true, currentWindow: true },
      expect.any(Function)
    );

    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(1, {
      type: "toggleCommandMode",
      enabled: true,
    });
  });

  test("should handle case when no active tab is found", () => {
    const checkbox = document.getElementById("turn-on") as HTMLInputElement;

    (chrome.tabs.query as jest.Mock).mockImplementation(
      (
        _queryInfo: chrome.tabs.QueryInfo,
        callback: (tabs: chrome.tabs.Tab[]) => void
      ) => {
        callback([]);
      }
    );

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change"));

    expect(chrome.storage.sync.set).toHaveBeenCalledWith(
      { enableCommandMode: true },
      expect.any(Function)
    );

    expect(chrome.tabs.query).toHaveBeenCalled();
    expect(chrome.tabs.sendMessage).not.toHaveBeenCalled();
  });

  test("should handle storage errors", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    (chrome.storage.sync.get as jest.Mock).mockImplementation(
      (
        _keys: string[],
        callback: (result: { enableCommandMode?: boolean }) => void
      ) => {
        callback(undefined as any);
      }
    );

    document.dispatchEvent(new Event("DOMContentLoaded"));

    const checkbox = document.getElementById("turn-on") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    consoleSpy.mockRestore();
  });
});
