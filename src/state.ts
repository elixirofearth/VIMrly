export enum Mode {
  NORMAL = "NORMAL",
  INSERT = "INSERT",
  VISUAL = "VISUAL",
}

export class VimState {
  private _mode: Mode = Mode.NORMAL;
  private _clipboard: string = "";

  setMode(newMode: Mode) {
    this._mode = newMode;
    console.log(`Switched to ${newMode} mode.`);
    this.updateStatusBar();
  }

  get mode(): Mode {
    return this._mode;
  }

  isInInsertMode(): boolean {
    return this._mode === Mode.INSERT;
  }

  isInNormalMode(): boolean {
    return this._mode === Mode.NORMAL;
  }

  isInVisualMode(): boolean {
    return this._mode === Mode.VISUAL;
  }

  setClipboard(text: string) {
    this._clipboard = text;
  }

  getClipboard(): string {
    return this._clipboard;
  }

  private updateStatusBar() {
    const statusBar = document.getElementById("vim-status-bar");
    if (statusBar) {
      statusBar.textContent = `MODE: ${this._mode}`;
    }
  }
}
