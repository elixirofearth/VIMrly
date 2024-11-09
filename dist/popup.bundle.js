/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!**********************!*\
  !*** ./src/popup.ts ***!
  \**********************/

document.addEventListener("DOMContentLoaded", () => {
    const insertModeCheckbox = document.getElementById("enable-insert-mode");
    // Load the current setting from storage
    chrome.storage.sync.get(["enableInsertMode"], (result) => {
        insertModeCheckbox.checked = result.enableInsertMode !== false;
    });
    // Update the setting when the checkbox state changes
    insertModeCheckbox.addEventListener("change", () => {
        const isEnabled = insertModeCheckbox.checked;
        chrome.storage.sync.set({ enableInsertMode: isEnabled }, () => {
            // Send message to content script
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                var _a;
                if ((_a = tabs[0]) === null || _a === void 0 ? void 0 : _a.id) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        type: "toggleInsertMode",
                        enabled: isEnabled,
                    });
                }
            });
            console.log(`Insert Mode has been ${isEnabled ? "enabled" : "disabled"}.`);
        });
    });
});

/******/ })()
;
//# sourceMappingURL=popup.bundle.js.map