"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VimState = exports.Mode = void 0;
var Mode;
(function (Mode) {
    Mode["NORMAL"] = "NORMAL";
    Mode["INSERT"] = "INSERT";
    Mode["VISUAL"] = "VISUAL";
})(Mode || (exports.Mode = Mode = {}));
class VimState {
    constructor() {
        this.mode = Mode.NORMAL;
    }
    // Transition to a new mode
    setMode(newMode) {
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
exports.VimState = VimState;
