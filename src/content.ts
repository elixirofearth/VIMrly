import { VimState, Mode } from "./state";
import { handleCommand } from "./commands";

const state = new VimState();

document.addEventListener("keydown", (event) => {
  // Prevent Google Docs from interfering
  event.preventDefault();

  // Interpret command based on mode and key
  handleCommand(event.key, state);
});
