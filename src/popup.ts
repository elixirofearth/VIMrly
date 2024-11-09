document.addEventListener("DOMContentLoaded", () => {
  const turnOnCheckbox = document.getElementById(
    "turn-on"
  ) as HTMLInputElement;

  // Load the current setting from storage
  chrome.storage.sync.get(["enableCommandMode"], (result) => {
    turnOnCheckbox.checked = result.enableCommandMode ?? false; // Default to false
  });

  // Update the setting when the checkbox state changes
  turnOnCheckbox.addEventListener("change", () => {
    const isEnabled = turnOnCheckbox.checked;
    chrome.storage.sync.set({ enableCommandMode: isEnabled }, () => {
      // Send message to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "toggleCommandMode",
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
