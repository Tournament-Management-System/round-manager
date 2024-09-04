import * as utils from "./utils.js";
import * as handlers from "./handlers.js";

export async function handler(event) {
  switch (event.path) {
    case "/start_rounds":
      return handlers.startRounds(typeof event.body === "string" ? JSON.parse(event.body) : event.body);
    case "/complete_round":
      return handlers.completeRound(typeof event.body === "string" ? JSON.parse(event.body) : event.body);
    default:
      return utils.respBuilder(400, { error: `the path "${event.path}" does not exist` });
  }
}
