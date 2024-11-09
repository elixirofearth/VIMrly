/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/commands.ts":
/*!*************************!*\
  !*** ./src/commands.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   handleCommand: () => (/* binding */ handleCommand)
/* harmony export */ });
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./state */ "./src/state.ts");

function handleCommand(key, state) {
    if (state.isInNormalMode()) {
        handleNormalMode(key, state);
    }
    else if (state.isInInsertMode()) {
        handleInsertMode(key, state);
    }
    else if (state.isInVisualMode()) {
        handleVisualMode(key, state);
    }
}
function handleNormalMode(key, state) {
    switch (key) {
        case "i":
            state.setMode(_state__WEBPACK_IMPORTED_MODULE_0__.Mode.INSERT);
            break;
        case "v":
            state.setMode(_state__WEBPACK_IMPORTED_MODULE_0__.Mode.VISUAL);
            break;
        case "h":
            moveCursorLeft();
            break;
        case "j":
            moveCursorDown();
            break;
        case "k":
            moveCursorUp();
            break;
        case "l":
            moveCursorRight();
            break;
        case "d":
            if (state.isInVisualMode()) {
                deleteSelectedText(state);
            }
            else {
                deleteCurrentLine();
            }
            break;
        case "y":
            yankText(state);
            break;
        case "p":
            pasteText(state);
            break;
        case "0":
            moveCursorToLineStart();
            break;
        case "$":
            moveCursorToLineEnd();
            break;
        default:
            console.log(`Unrecognized command: ${key}`);
            break;
    }
}
function handleInsertMode(key, state) {
    if (key === "Escape" || key === "Esc") {
        state.setMode(_state__WEBPACK_IMPORTED_MODULE_0__.Mode.NORMAL);
    }
}
function handleVisualMode(key, state) {
    if (key === "Escape" || key === "Esc") {
        state.setMode(_state__WEBPACK_IMPORTED_MODULE_0__.Mode.NORMAL);
        clearSelection();
    }
    else {
        switch (key) {
            case "h":
                extendSelectionLeft();
                break;
            case "j":
                extendSelectionDown();
                break;
            case "k":
                extendSelectionUp();
                break;
            case "l":
                extendSelectionRight();
                break;
            case "y":
                yankText(state);
                state.setMode(_state__WEBPACK_IMPORTED_MODULE_0__.Mode.NORMAL);
                break;
            case "d":
                deleteSelectedText(state);
                state.setMode(_state__WEBPACK_IMPORTED_MODULE_0__.Mode.NORMAL);
                break;
        }
    }
}
function yankText(state) {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
        state.setClipboard(selection.toString());
        clearSelection();
    }
    else {
        // If no selection, yank current line
        simulateKeyPressWithModifiers(["Control", "Shift"], "ArrowLeft");
        const lineSelection = window.getSelection();
        if (lineSelection) {
            state.setClipboard(lineSelection.toString());
            clearSelection();
        }
    }
}
function pasteText(state) {
    const clipboardText = state.getClipboard();
    if (clipboardText) {
        // Use the browser's clipboard API to paste text
        navigator.clipboard.writeText(clipboardText).then(() => {
            simulateKeyPressWithModifiers(["Control"], "v");
        });
    }
}
function deleteSelectedText(state) {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
        state.setClipboard(selection.toString()); // Save to clipboard before deleting
        simulateKeyPress("Delete");
    }
}
function clearSelection() {
    var _a;
    (_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.removeAllRanges();
}
function extendSelectionLeft() {
    simulateKeyPressWithModifiers(["Shift"], "ArrowLeft");
}
function extendSelectionRight() {
    simulateKeyPressWithModifiers(["Shift"], "ArrowRight");
}
function extendSelectionUp() {
    simulateKeyPressWithModifiers(["Shift"], "ArrowUp");
}
function extendSelectionDown() {
    simulateKeyPressWithModifiers(["Shift"], "ArrowDown");
}
function moveCursorToLineStart() {
    simulateKeyPress("Home");
}
function moveCursorToLineEnd() {
    simulateKeyPress("End");
}
// Existing movement and utility functions remain the same
function moveCursorLeft() {
    simulateKeyPress("ArrowLeft");
}
function moveCursorRight() {
    simulateKeyPress("ArrowRight");
}
function moveCursorUp() {
    simulateKeyPress("ArrowUp");
}
function moveCursorDown() {
    simulateKeyPress("ArrowDown");
}
function deleteCurrentLine() {
    simulateKeyPressWithModifiers(["Control", "Shift"], "ArrowLeft");
    simulateKeyPress("Backspace");
}
function simulateKeyPress(key) {
    const event = new KeyboardEvent("keydown", {
        key: key,
        bubbles: true,
        cancelable: true,
    });
    document.dispatchEvent(event);
}
function simulateKeyPressWithModifiers(modifiers, key) {
    const eventInit = {
        key: key,
        bubbles: true,
        cancelable: true,
        shiftKey: modifiers.includes("Shift"),
        ctrlKey: modifiers.includes("Control"),
        altKey: modifiers.includes("Alt"),
        metaKey: modifiers.includes("Meta"),
    };
    const event = new KeyboardEvent("keydown", eventInit);
    document.dispatchEvent(event);
}


/***/ }),

/***/ "./src/state.ts":
/*!**********************!*\
  !*** ./src/state.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Mode: () => (/* binding */ Mode),
/* harmony export */   VimState: () => (/* binding */ VimState)
/* harmony export */ });
var Mode;
(function (Mode) {
    Mode["NORMAL"] = "NORMAL";
    Mode["INSERT"] = "INSERT";
    Mode["VISUAL"] = "VISUAL";
})(Mode || (Mode = {}));
class VimState {
    constructor() {
        this._mode = Mode.NORMAL;
        this._clipboard = "";
    }
    setMode(newMode) {
        this._mode = newMode;
        console.log(`Switched to ${newMode} mode.`);
        this.updateStatusBar();
    }
    get mode() {
        return this._mode;
    }
    isInInsertMode() {
        return this._mode === Mode.INSERT;
    }
    isInNormalMode() {
        return this._mode === Mode.NORMAL;
    }
    isInVisualMode() {
        return this._mode === Mode.VISUAL;
    }
    setClipboard(text) {
        this._clipboard = text;
    }
    getClipboard() {
        return this._clipboard;
    }
    updateStatusBar() {
        const statusBar = document.getElementById("vim-status-bar");
        if (statusBar) {
            statusBar.textContent = `MODE: ${this._mode}`;
        }
    }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!************************!*\
  !*** ./src/content.ts ***!
  \************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./state */ "./src/state.ts");
/* harmony import */ var _commands__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./commands */ "./src/commands.ts");


// Initialize Vim state
const state = new _state__WEBPACK_IMPORTED_MODULE_0__.VimState();
// Add message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "toggleInsertMode") {
        console.log(`Toggling insert mode: ${message.enabled}`);
        if (message.enabled) {
            state.setMode(_state__WEBPACK_IMPORTED_MODULE_0__.Mode.INSERT);
        }
        else {
            state.setMode(_state__WEBPACK_IMPORTED_MODULE_0__.Mode.NORMAL);
        }
    }
});
// Create and display the status bar
function createStatusBar() {
    const statusBar = document.createElement("div");
    statusBar.id = "vim-status-bar";
    statusBar.style.position = "fixed";
    statusBar.style.bottom = "0";
    statusBar.style.left = "0";
    statusBar.style.width = "100%";
    statusBar.style.height = "20px";
    statusBar.style.backgroundColor = "#2e3436";
    statusBar.style.color = "#ffffff";
    statusBar.style.fontFamily = "monospace";
    statusBar.style.fontSize = "12px";
    statusBar.style.textAlign = "center";
    statusBar.style.zIndex = "9999";
    statusBar.textContent = `MODE: ${state.mode}`;
    document.body.appendChild(statusBar);
}
// Initialize the extension
function init() {
    createStatusBar();
    document.addEventListener("keydown", (event) => {
        const activeElement = document.activeElement;
        // If in Insert mode and focused on input fields, do not intercept
        if (state.isInInsertMode() &&
            (activeElement.tagName === "INPUT" ||
                activeElement.tagName === "TEXTAREA" ||
                activeElement.isContentEditable)) {
            return;
        }
        // Prevent default behavior for intercepted keys
        const interceptedKeys = [
            "h",
            "j",
            "k",
            "l",
            "i",
            "v",
            "d",
            "y",
            "p",
            "Escape",
            "Esc",
        ];
        if (interceptedKeys.includes(event.key)) {
            event.preventDefault();
            (0,_commands__WEBPACK_IMPORTED_MODULE_1__.handleCommand)(event.key, state);
        }
    });
}
// Wait for the DOM to load before initializing
window.addEventListener("DOMContentLoaded", init);

})();

/******/ })()
;
//# sourceMappingURL=content.bundle.js.map