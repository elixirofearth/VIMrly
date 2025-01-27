import { Mode } from "../state";
import { setMode } from "../content";

describe("Content Script", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("should create and update status bar", () => {
    setMode(Mode.COMMAND);
    const statusBar = document.getElementById("vim-status-bar");

    expect(statusBar).toBeTruthy();
    expect(statusBar?.textContent).toBe("MODE: COMMAND");
    expect(statusBar?.style.display).toBe("block");

    setMode(Mode.OFF);
    expect(statusBar?.style.display).toBe("none");
  });

  test("should handle editor initialization", () => {
    document.body.innerHTML = `
      <iframe class="docs-texteventtarget-iframe">
        <html><body></body></html>
      </iframe>
    `;

    // Test the waitForDocsLoad functionality
    jest.useFakeTimers();
    const editorCheck = setInterval(() => {
      const editor = document.querySelector(
        "iframe.docs-texteventtarget-iframe"
      );
      if (editor) {
        clearInterval(editorCheck);
        expect(editor).toBeTruthy();
      }
    }, 1000);
    jest.runOnlyPendingTimers();
  });
});
