import * as utils from "./utils.js";
import * as handlers from "./handlers.js";

export async function handler(event) {
  switch (event.path) {
    case "/startRounds":
      return handlers.startRounds(event.body);
    case "/completeRound":
      return handlers.completeRound(event.body);
    default:
      return utils.respBuilder(400, { error: `the path "${event.path}" does not exist` });
  }
}