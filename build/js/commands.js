"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCommand = handleCommand;
const state_1 = require("./state");
function handleCommand(key, state) {
    if (state.isInNormalMode()) {
        if (key === "i") {
            state.setMode(state_1.Mode.INSERT);
        }
        else if (key === "v") {
            state.setMode(state_1.Mode.VISUAL);
        }
        else if (key === "h") {
            moveCursorLeft();
        }
        else if (key === "j") {
            moveCursorDown();
        }
        else if (key === "k") {
            moveCursorUp();
        }
        else if (key === "l") {
            moveCursorRight();
        }
    }
    else if (state.isInInsertMode()) {
        if (key === "Escape") {
            state.setMode(state_1.Mode.NORMAL);
        }
    }
}
function moveCursorLeft() {
    console.log("Moving cursor left.");
    // Implement cursor movement logic for Google Docs
}
function moveCursorDown() {
    console.log("Moving cursor down.");
    // Implement cursor movement logic for Google Docs
}
function moveCursorUp() {
    console.log("Moving cursor up.");
    // Implement cursor movement logic for Google Docs
}
function moveCursorRight() {
    console.log("Moving cursor right.");
    // Implement cursor movement logic for Google Docs
}
