import { Mode, VimState } from "../state";

describe("VimState", () => {
  let state: VimState;

  beforeEach(() => {
    state = new VimState();
    // Mock DOM element
    document.body.innerHTML = '<div id="vim-status-bar"></div>';
  });

  test("should initialize in OFF mode", () => {
    expect(state.mode).toBe(Mode.OFF);
  });

  test("should change modes correctly", () => {
    state.setMode(Mode.COMMAND);
    expect(state.mode).toBe(Mode.COMMAND);
    expect(state.isInCommandMode()).toBe(true);

    state.setMode(Mode.INSERT);
    expect(state.mode).toBe(Mode.INSERT);
    expect(state.isInInsertMode()).toBe(true);

    state.setMode(Mode.VISUAL);
    expect(state.mode).toBe(Mode.VISUAL);
    expect(state.isInVisualMode()).toBe(true);

    state.setMode(Mode.OFF);
    expect(state.mode).toBe(Mode.OFF);
    expect(state.isInOffMode()).toBe(true);
  });

  test("should handle clipboard operations", () => {
    const testText = "Hello World";
    state.setClipboard(testText);
    expect(state.getClipboard()).toBe(testText);
  });

  test("should handle command operations", () => {
    const command = "dd";
    state.setPendingCommand(command);
    expect(state.pendingCommand).toBe(command);

    state.setLastCommand(command);
    expect(state.lastCommand).toBe(command);
  });
});
