const RoundManager = require("../teems-round-manager/index");
const handlers = require("../teems-round-manager/handlers");
const utils = require("../teems-round-manager/utils");

jest.mock("../teems-round-manager/handlers");
jest.mock("../teems-round-manager/utils");

describe("aws lambda handler", () => {
  test("start rounds", async () => {
    const eventBody = { path: "/startRounds" };
    const startRoundsMock = jest.fn();
    handlers.startRounds.mockImplementation(startRoundsMock);
    await RoundManager.handler(eventBody);
    expect(startRoundsMock).toHaveBeenCalledWith(eventBody);
  });

  test("complete rounds", async () => {
    const eventBody = { path: "/completeRound" };
    const completeRoundMock = jest.fn();
    handlers.completeRound.mockImplementation(completeRoundMock);
    await RoundManager.handler(eventBody);
    expect(completeRoundMock).toHaveBeenCalledWith(eventBody);
  });

  test("invalid rounds", async () => {
    const path = "/not_a_real_path";
    const eventBody = { path };
    const respBuilderMock = jest.fn();
    utils.respBuilder.mockImplementation(respBuilderMock);
    await RoundManager.handler(eventBody);
    expect(respBuilderMock).toHaveBeenCalledWith(400, { error: `the path "${path}" does not exist` });
  });
});