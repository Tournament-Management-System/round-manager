const RoundManager = require("../teems-round-manager/index");

describe("handler check", () => {
  test("handler check test", () => {
    console.log(RoundManager.handler({ path: "/startRound" }));
  });
});
