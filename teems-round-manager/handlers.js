const utils = require("./utils");

const startRounds = () => {
    return utils.respBuilder(200, "/startRounds");
};

const completeRound = () => {
    return utils.respBuilder(200, "/completeRound");
};

module.exports = {
    startRounds,
    completeRound
};