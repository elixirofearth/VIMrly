document.addEventListener("DOMContentLoaded", () => {
  const insertModeCheckbox = document.getElementById(
    "enable-insert-mode"
  ) as HTMLInputElement;

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
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "toggleInsertMode",
            enabled: isEnabled,
          });
        }
      });
      console.log(
        `Insert Mode has been ${isEnabled ? "enabled" : "disabled"}.`
      );
    });
  });
});
