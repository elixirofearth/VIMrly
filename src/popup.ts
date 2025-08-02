document.addEventListener("DOMContentLoaded", () => {
  const turnOnCheckbox = document.getElementById("turn-on") as HTMLInputElement;

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
        if (tabs[0]?.id && tabs[0]?.url?.includes("docs.google.com")) {
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              type: "toggleCommandMode",
              enabled: isEnabled,
            },
            (response) => {
              // Handle response or error
              if (chrome.runtime.lastError) {
                console.log(
                  "Content script not ready or not on Google Docs:",
                  chrome.runtime.lastError.message
                );
              } else if (response?.success) {
                console.log(
                  `Message sent successfully - Mode set to: ${response.mode}`
                );
              } else {
                console.log("Message sent but no response received");
              }
            }
          );
        } else {
          console.log(
            "Not on a Google Docs page - settings saved but not applied"
          );
        }
      });
      console.log(`Vim Mode has been ${isEnabled ? "enabled" : "disabled"}.`);
    });
  });
});
