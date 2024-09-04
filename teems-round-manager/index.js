const utils = require("./utils");
const handlers = require("./handlers");

exports.handler = async (event) => {
  // TODO implement
  switch (event?.path) {
    case "/startRounds":
      return handlers.startRounds(event);
    case "/completeRound":
      return handlers.completeRound(event);
    default:
      return utils.respBuilder(400, { error: `the path "${event.path}" does not exist` });
  }
};