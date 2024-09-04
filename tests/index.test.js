import * as RoundManager from "../teems-round-manager/index.js";
import * as handlers from "../teems-round-manager/handlers.js";
import * as utils from "../teems-round-manager/utils";

jest.mock("../teems-round-manager/handlers");
jest.mock("../teems-round-manager/utils");

describe("aws lambda handler", () => {
  test("start rounds", async () => {
    const eventBody = { path: "/startRounds", body: { tournamentStateId: "12345", eventFormatId: "12345" } };
    const startRoundsMock = jest.fn();
    handlers.startRounds.mockImplementation(startRoundsMock);
    await RoundManager.handler(eventBody);
    expect(startRoundsMock).toHaveBeenCalledWith(eventBody.body);
  });

  test("complete rounds", async () => {
    const eventBody = { path: "/completeRound", body: { tournamentStateId: "12345", eventFormatId: "12345" } };
    const completeRoundMock = jest.fn();
    handlers.completeRound.mockImplementation(completeRoundMock);
    await RoundManager.handler(eventBody);
    expect(completeRoundMock).toHaveBeenCalledWith(eventBody.body);
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
