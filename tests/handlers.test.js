import * as handlers from "../teems-round-manager/handlers.js";
import * as queries from "../teems-round-manager/queries.js";

jest.mock("../teems-round-manager/queries");

const eventFormatMock = {
  name: "Tournament",
  awards: [
    {
      awardName: "Finalists",
      numWinners: 6,
      awardCriteria: "highest_last_round"
    },
    {
      awardName: "Sweepstake",
      numWinners: 6,
      awardCriteria: "highest_all_rounds"
    }
  ],
  rounds: [
    {
      roundIndex: 0,
      competitorLimit: 3,
      groupLimit: null,
      judgesPerRound: 1,
      judgingCriteria: undefined
    },
    {
      roundIndex: 1,
      competitorLimit: 3,
      groupLimit: null,
      judgesPerRound: 1,
      judgingCriteria: "highest_all_rounds"
    },
    {
      roundIndex: 2,
      competitorLimit: 3,
      groupLimit: 2,
      judgesPerRound: 3,
      judgingCriteria: "highest_this_round"
    },
    {
      roundIndex: 3,
      competitorLimit: 3,
      groupLimit: 1,
      judgesPerRound: 3,
      judgingCriteria: undefined
    }
  ]
};

describe("startRounds", () => {
  test("initial round", async () => {
    const getEventFormatMock = jest.fn(() => eventFormatMock);
    const getEventCompetitorsMock = jest.fn(() => ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "c11"]);
    const createEventStateMock = jest.fn((tournamentFormatId, tournamentStateId, eventFormatId) => ({
      id: "es123",
      eventFormatId,
      currentRoundIdx: -1,
      awards: [],
      tournamentFormatId,
      tournamentStateId
    }));
    const createRoundStateMock = jest.fn(
      (tournamentFormatId, tournamentStateId, eventFormatId, eventStateId, queued) => ({
        tournamentFormatId,
        tournamentStateId,
        eventFormatId,
        eventStateId,
        assigned: [],
        started: [],
        completed: [],
        queued
      })
    );
    const startGroupsMock = jest.fn(() => { });
    const getTournamentStateOnlyMock = jest.fn(() => ({
      id: "ts123",
      judges: [],
      tournamentFormatId: "tf123",
      competitors: [],
      eventFormatIds: ["ef123"]
    }));

    queries.getEventFormat.mockImplementation(getEventFormatMock);
    queries.getEventCompetitors.mockImplementation(getEventCompetitorsMock);
    queries.getTournamentStateOnly.mockImplementation(getTournamentStateOnlyMock);

    queries.createEventState.mockImplementation(createEventStateMock);

    queries.createRoundStateWithQueued.mockImplementation(createRoundStateMock);

    queries.startGroups.mockImplementation(startGroupsMock);

    const response = await handlers.startRounds({ tournamentStateId: "ts123", eventFormatId: "ef123" });
    expect(JSON.parse(response.body)).toEqual({
      roundState: {
        tournamentStateId: "ts123",
        eventFormatId: "ef123",
        eventStateId: "es123",
        assigned: [],
        started: [],
        completed: [],
        queued: [
          {
            groupId: 0,
            judges: [],
            competitors: ["c1", "c2", "c3"],
            ranking: { c1: null, c2: null, c3: null },
            comments: { c1: null, c2: null, c3: null }
          },
          {
            groupId: 1,
            judges: [],
            competitors: ["c4", "c5", "c6"],
            ranking: { c4: null, c5: null, c6: null },
            comments: { c4: null, c5: null, c6: null }
          },
          {
            groupId: 2,
            judges: [],
            competitors: ["c7", "c8", "c9"],
            ranking: { c7: null, c8: null, c9: null },
            comments: { c7: null, c8: null, c9: null }
          },
          {
            groupId: 3,
            judges: [],
            competitors: ["c10", "c11"],
            ranking: { c10: null, c11: null },
            comments: { c10: null, c11: null }
          }
        ]
      },
      eventState: { id: "es123", eventFormatId: "ef123", tournamentStateId: "ts123", awards: [], currentRoundIdx: 0 }
    });
  });

  test("initiating an event that already has an event state", async () => {
    const getEventFormatMock = jest.fn(() => eventFormatMock);
    const getEventCompetitorsMock = jest.fn(() => ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "c11"]);
    const createEventStateMock = jest.fn((tournamentFormatId, tournamentStateId, eventFormatId) => ({
      id: "es123",
      eventFormatId,
      currentRoundIdx: -1,
      awards: [],
      tournamentFormatId,
      tournamentStateId
    }));
    const createRoundStateMock = jest.fn(
      (tournamentFormatId, tournamentStateId, eventFormatId, eventStateId, queued) => ({
        tournamentFormatId,
        tournamentStateId,
        eventFormatId,
        eventStateId,
        assigned: [],
        started: [],
        completed: [],
        queued
      })
    );
    const startGroupsMock = jest.fn(() => { });
    const getTournamentStateOnlyMock = jest.fn(() => ({
      id: "ts123",
      tournamentStateEventStateId: "es123",
      judges: [],
      tournamentFormatId: "tf123",
      competitors: [],
      eventFormatIds: ["ef123"]
    }));

    queries.getEventFormat.mockImplementation(getEventFormatMock);
    queries.getEventCompetitors.mockImplementation(getEventCompetitorsMock);
    queries.getTournamentStateOnly.mockImplementation(getTournamentStateOnlyMock);

    queries.createEventState.mockImplementation(createEventStateMock);

    queries.createRoundStateWithQueued.mockImplementation(createRoundStateMock);

    queries.startGroups.mockImplementation(startGroupsMock);

    const response = await handlers.startRounds({ tournamentStateId: "ts123", eventFormatId: "ef123" });
    expect(JSON.parse(response.body)).toEqual({ error: 'event state has been initiated with ID "es123"' });
  });
  test("missing body", async () => {
    const { statusCode } = await handlers.startRounds();
    expect(statusCode).toEqual(400);
  });

  test("missing tournamentStateId", async () => {
    const { statusCode } = await handlers.startRounds({
      eventFormatId: "ef123"
    });
    expect(statusCode).toEqual(400);
  });

  test("missing eventFormatId", async () => {
    const { statusCode } = await handlers.startRounds({
      tournamentStateId: "ts123"
    });
    expect(statusCode).toEqual(400);
  });
});

describe("completeRound", () => { });