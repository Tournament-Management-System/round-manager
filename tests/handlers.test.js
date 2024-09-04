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
    const createEventStateMock = jest.fn((tournamentFormatId, tournamentStateId, eventFormatId, currentRoundIdx) => ({
      id: "es123",
      eventFormatId,
      currentRoundIdx,
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
    const startGroupsMock = jest.fn(() => {});
    const getTournamentStateOnlyMock = jest.fn(() => []);

    queries.getEventFormat.mockImplementation(getEventFormatMock);
    queries.getEventCompetitors.mockImplementation(getEventCompetitorsMock);
    queries.getTournamentStateEventStates.mockImplementation(getTournamentStateOnlyMock);
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
            comments: { c1: null, c2: null, c3: null },
            roomId: null
          },
          {
            groupId: 1,
            judges: [],
            competitors: ["c4", "c5", "c6"],
            ranking: { c4: null, c5: null, c6: null },
            comments: { c4: null, c5: null, c6: null },
            roomId: null
          },
          {
            groupId: 2,
            judges: [],
            competitors: ["c7", "c8", "c9"],
            ranking: { c7: null, c8: null, c9: null },
            comments: { c7: null, c8: null, c9: null },
            roomId: null
          },
          {
            groupId: 3,
            judges: [],
            competitors: ["c10", "c11"],
            ranking: { c10: null, c11: null },
            comments: { c10: null, c11: null },
            roomId: null
          }
        ]
      },
      eventState: { id: "es123", eventFormatId: "ef123", tournamentStateId: "ts123", awards: [], currentRoundIdx: 0 }
    });
  });

  test("initiate event that is already started", async () => {
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
    const startGroupsMock = jest.fn(() => {});
    const getTournamentStateOnlyMock = jest.fn(() => ({
      tournamentFormatId: "tf123",
      eventState: {
        items: [
          {
            _version: 1,
            _lastChangedAt: 1668290740087,
            _deleted: null,
            id: "es123",
            eventFormatId: "ef123"
          }
        ]
      }
    }));

    queries.getEventFormat.mockImplementation(getEventFormatMock);
    queries.getEventCompetitors.mockImplementation(getEventCompetitorsMock);
    queries.getTournamentStateEventStates.mockImplementation(getTournamentStateOnlyMock);
    queries.createEventState.mockImplementation(createEventStateMock);
    queries.createRoundStateWithQueued.mockImplementation(createRoundStateMock);
    queries.startGroups.mockImplementation(startGroupsMock);

    const response = await handlers.startRounds({ tournamentStateId: "ts123", eventFormatId: "ef123" });
    expect(JSON.parse(response.body)).toEqual({
      error: 'eventFormatId "ef123" has been initiated with eventStateId "es123"'
    });
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

describe("completeRound", () => {
  test("complete round", async () => {
    const getRoundStateMock = jest.fn(() => ({
      assigned: [],
      completed: [
        {
          groupId: 0,
          judges: [],
          competitors: ["c1", "c2", "c3"],
          ranking: { c1: 1, c2: 2, c3: 3 },
          comments: { c1: null, c2: null, c3: null }
        },
        {
          groupId: 1,
          judges: [],
          competitors: ["c4", "c5", "c6"],
          ranking: { c4: 1, c5: 2, c6: 3 },
          comments: { c4: null, c5: null, c6: null }
        },
        {
          groupId: 2,
          judges: [],
          competitors: ["c7", "c8", "c9"],
          ranking: { c7: 1, c8: 2, c9: 3 },
          comments: { c7: null, c8: null, c9: null }
        },
        {
          groupId: 3,
          judges: [],
          competitors: ["c10", "c11"],
          ranking: { c10: 1, c11: 2 },
          comments: { c10: null, c11: null }
        }
      ],
      eventFormatId: "ef123",
      eventStateId: "es123",
      id: "rs123",
      queued: [],
      started: [],
      tournamentFormatId: "tf123",
      tournamentStateId: "ts123"
    }));
    const getEventFormatMock = jest.fn(() => eventFormatMock);
    const getEventStateMock = jest.fn(() => ({
      awards: [],
      currentRoundIdx: 0,
      eventFormatId: "ef123",
      id: "es123",
      tournamentFormatId: "tf123",
      tournamentStateId: "ts123"
    }));
    const updateEventStateAwardMock = jest.fn((eventStateId, awards, version) => ({
      awards,
      currentRoundIdx: 0,
      eventFormatId: "ef123",
      id: eventStateId,
      tournamentFormatId: "ef123",
      tournamentStateId: "es123"
    }));
    const updateEventStateIndexMock = jest.fn((eventStateId, currentRoundIdx, version) => ({
      awards: [],
      currentRoundIdx,
      eventFormatId: "ef123",
      id: eventStateId,
      tournamentFormatId: "tf123",
      tournamentStateId: "ts123"
    }));
    const getEventCompetitorsMock = jest.fn(() => ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "c11"]);
    const createRoundStateMock = jest.fn(
      (tournamentFormatId, tournamentStateId, eventFormatId, eventStateId, queued) => ({
        tournamentFormatId,
        tournamentStateId,
        eventFormatId,
        eventStateId,
        assigned: [],
        started: [],
        completed: [],
        queued,
        id: "rs234"
      })
    );
    const getEventStateRoundStatesMock = jest.fn(() => [
      {
        assigned: [],
        queued: [],
        started: [],
        completed: [
          {
            groupId: 0,
            judges: [],
            competitors: ["c1", "c2", "c3"],
            ranking: { c1: 1, c2: 2, c3: 3 },
            comments: { c1: null, c2: null, c3: null }
          },
          {
            groupId: 1,
            judges: [],
            competitors: ["c4", "c5", "c6"],
            ranking: { c4: 1, c5: 2, c6: 3 },
            comments: { c4: null, c5: null, c6: null }
          },
          {
            groupId: 2,
            judges: [],
            competitors: ["c7", "c8", "c9"],
            ranking: { c7: 1, c8: 2, c9: 3 },
            comments: { c7: null, c8: null, c9: null }
          },
          {
            groupId: 3,
            judges: [],
            competitors: ["c10", "c11"],
            ranking: { c10: 1, c11: 2 },
            comments: { c10: null, c11: null }
          }
        ]
      }
    ]);
    const getEventStateWithRoundsMock = jest.fn(() => ({
      awards: [],
      currentRoundIdx: 0,
      eventFormatId: "ef123",
      id: "es123",
      tournamentFormatId: "tf123",
      tournamentStateId: "ts123",
      roundState: {
        items: []
      }
    }));
    queries.getEventStateWithRounds.mockImplementation(getEventStateWithRoundsMock);
    queries.getRoundState.mockImplementation(getRoundStateMock);
    queries.getEventFormat.mockImplementation(getEventFormatMock);
    queries.getEventState.mockImplementation(getEventStateMock);
    queries.updateEventStateAward.mockImplementation(updateEventStateAwardMock);
    queries.updateEventStateIndex.mockImplementation(updateEventStateIndexMock);
    queries.getEventCompetitors.mockImplementation(getEventCompetitorsMock);
    queries.createRoundStateWithQueued.mockImplementation(createRoundStateMock);
    queries.getEventStateRoundStates.mockImplementation(getEventStateRoundStatesMock);

    const response = await handlers.completeRound({ roundStateId: "rs123" });
    expect(JSON.parse(response.body)).toEqual({
      roundState: {
        id: "rs234",
        tournamentFormatId: "tf123",
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
            competitors: ["c9", "c6", "c3"],
            ranking: { c9: null, c6: null, c3: null },
            comments: { c9: null, c6: null, c3: null },
            roomId: null
          },
          {
            groupId: 1,
            judges: [],
            competitors: ["c11", "c8", "c5"],
            ranking: { c11: null, c8: null, c5: null },
            comments: { c11: null, c8: null, c5: null },
            roomId: null
          },
          {
            groupId: 2,
            judges: [],
            competitors: ["c2", "c10", "c7"],
            ranking: { c2: null, c10: null, c7: null },
            comments: { c2: null, c10: null, c7: null },
            roomId: null
          },
          {
            groupId: 3,
            judges: [],
            competitors: ["c4", "c1"],
            ranking: { c4: null, c1: null },
            comments: { c4: null, c1: null },
            roomId: null
          }
        ]
      },
      eventState: {
        awards: [],
        currentRoundIdx: 1,
        eventFormatId: "ef123",
        id: "es123",
        tournamentFormatId: "tf123",
        tournamentStateId: "ts123"
      }
    });
  });

  test("not completed round", async () => {
    const getRoundStateMock = jest.fn(() => ({
      assigned: [
        {
          groupId: 0,
          judges: [],
          competitors: ["c1", "c2", "c3"],
          ranking: { c1: null, c2: null, c3: null },
          comments: { c1: null, c2: null, c3: null }
        }
      ],
      completed: [
        {
          groupId: 1,
          judges: [],
          competitors: ["c4", "c5", "c6"],
          ranking: { c4: 1, c5: 2, c6: 3 },
          comments: { c4: null, c5: null, c6: null }
        },
        {
          groupId: 2,
          judges: [],
          competitors: ["c7", "c8", "c9"],
          ranking: { c7: 1, c8: 2, c9: 3 },
          comments: { c7: null, c8: null, c9: null }
        },
        {
          groupId: 3,
          judges: [],
          competitors: ["c10", "c11"],
          ranking: { c10: 1, c11: 2 },
          comments: { c10: null, c11: null }
        }
      ],
      eventFormatId: "ef123",
      eventStateId: "es123",
      id: "rs123",
      queued: [],
      started: [],
      tournamentFormatId: "tf123",
      tournamentStateId: "ts123"
    }));
    const getEventFormatMock = jest.fn(() => eventFormatMock);
    const getEventStateMock = jest.fn(() => ({
      awards: [],
      currentRoundIdx: 0,
      eventFormatId: "ef123",
      id: "es123",
      tournamentFormatId: "tf123",
      tournamentStateId: "ts123"
    }));
    const updateEventStateAwardMock = jest.fn((eventStateId, awards, version) => ({
      awards,
      currentRoundIdx: 0,
      eventFormatId: "ef123",
      id: eventStateId,
      tournamentFormatId: "ef123",
      tournamentStateId: "es123"
    }));
    const getEventCompetitorsMock = jest.fn(() => ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "c11"]);
    const createRoundStateMock = jest.fn(
      (tournamentFormatId, tournamentStateId, eventFormatId, eventStateId, queued) => ({
        tournamentFormatId,
        tournamentStateId,
        eventFormatId,
        eventStateId,
        assigned: [],
        started: [],
        completed: [],
        queued,
        id: "rs234"
      })
    );
    const getEventStateWithRoundsMock = jest.fn(() => ({
      awards: [],
      currentRoundIdx: 0,
      eventFormatId: "ef123",
      id: "es123",
      tournamentFormatId: "tf123",
      tournamentStateId: "ts123",
      roundState: {
        items: []
      }
    }));
    queries.getEventStateWithRounds.mockImplementation(getEventStateWithRoundsMock);

    queries.getRoundState.mockImplementation(getRoundStateMock);
    queries.getEventFormat.mockImplementation(getEventFormatMock);
    queries.getEventState.mockImplementation(getEventStateMock);
    queries.updateEventStateAward.mockImplementation(updateEventStateAwardMock);
    queries.getEventCompetitors.mockImplementation(getEventCompetitorsMock);
    queries.createRoundStateWithQueued.mockImplementation(createRoundStateMock);

    const response = await handlers.completeRound({ roundStateId: "rs123" });
    expect(JSON.parse(response.body)).toEqual({
      error: "round not finished - not all groups have completed",
      roundState: {
        assigned: [
          {
            groupId: 0,
            judges: [],
            competitors: ["c1", "c2", "c3"],
            ranking: { c1: null, c2: null, c3: null },
            comments: { c1: null, c2: null, c3: null }
          }
        ],
        completed: [
          {
            groupId: 1,
            judges: [],
            competitors: ["c4", "c5", "c6"],
            ranking: { c4: 1, c5: 2, c6: 3 },
            comments: { c4: null, c5: null, c6: null }
          },
          {
            groupId: 2,
            judges: [],
            competitors: ["c7", "c8", "c9"],
            ranking: { c7: 1, c8: 2, c9: 3 },
            comments: { c7: null, c8: null, c9: null }
          },
          {
            groupId: 3,
            judges: [],
            competitors: ["c10", "c11"],
            ranking: { c10: 1, c11: 2 },
            comments: { c10: null, c11: null }
          }
        ],
        eventFormatId: "ef123",
        eventStateId: "es123",
        id: "rs123",
        queued: [],
        started: [],
        tournamentFormatId: "tf123",
        tournamentStateId: "ts123"
      }
    });
  });

  test("missing body", async () => {
    const { statusCode } = await handlers.completeRound();
    expect(statusCode).toEqual(400);
  });

  test("missing tournamentStateId", async () => {
    const { statusCode } = await handlers.completeRound({
      eventFormatId: "ef123"
    });
    expect(statusCode).toEqual(400);
  });
});
