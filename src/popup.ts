document.addEventListener("DOMContentLoaded", () => {
  const insertModeCheckbox = document.getElementById(
    "enable-insert-mode"
  ) as HTMLInputElement;

  // Load the current setting from storage
  chrome.storage.sync.get(["enableInsertMode"], (result) => {
    insertModeCheckbox.checked = result.enableInsertMode !== false; // Default to true if not set
  });

  // Update the setting when the checkbox state changes
  insertModeCheckbox.addEventListener("change", () => {
    const isEnabled = insertModeCheckbox.checked;
    chrome.storage.sync.set({ enableInsertMode: isEnabled }, () => {
      console.log(
        `Insert Mode has been ${isEnabled ? "enabled" : "disabled"}.`
      );
    });
  });
});
