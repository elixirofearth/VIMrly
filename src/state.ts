export enum Mode {
  NORMAL = "NORMAL",
  INSERT = "INSERT",
  VISUAL = "VISUAL",
}

export class VimState {
  mode: Mode = Mode.NORMAL;

  // Transition to a new mode
  setMode(newMode: Mode) {
    this.mode = newMode;
    console.log(`Switched to ${newMode} mode.`);
  }

  isInInsertMode() {
    return this.mode === Mode.INSERT;
  }

  isInNormalMode() {
    return this.mode === Mode.NORMAL;
  }

  isInVisualMode() {
    return this.mode === Mode.VISUAL;
  }
}
