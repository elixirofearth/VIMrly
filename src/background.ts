// src/background.ts

chrome.runtime.onInstalled.addListener(() => {
  console.log("Vim for Google Docs extension installed.");
});
