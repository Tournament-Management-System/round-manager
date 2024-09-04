const utils = require("./utils");

exports.handler = async (event) => {
  // TODO implement
  switch (event?.path) {
    case "/startRounds":
      return utils.respBuilder(200, { path: "/startRounds" });
    case "/completeRound":
      return utils.respBuilder(200, { path: "/completeRound" });
    default:
      return utils.respBuilder(400, { error: `the path "${event.path}" does not exist` });
  }
};