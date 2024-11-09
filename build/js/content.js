"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state_1 = require("./state");
const commands_1 = require("./commands");
const state = new state_1.VimState();
document.addEventListener("keydown", (event) => {
    // Prevent Google Docs from interfering
    event.preventDefault();
    // Interpret command based on mode and key
    (0, commands_1.handleCommand)(event.key, state);
});
