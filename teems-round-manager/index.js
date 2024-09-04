import * as utils from "./utils.js";
import * as handlers from "./handlers.js";
import fetch from "node-fetch";

export async function handler(event) {
  // TODO implement
  switch (event.path) {
    case "/startRounds":
      return handlers.startRounds(event.body);
    case "/completeRound":
      return handlers.completeRound(event.body);
    default:
      const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
      const respJson = await response.json();
      return utils.respBuilder(400, { error: `the path "${event.path}" does not exist`, respJson });
  }
}
