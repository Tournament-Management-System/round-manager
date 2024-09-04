const handlers = require("../teems-round-manager/handlers");
const queries = require("../teems-round-manager/queries");

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
        const createEventStateMock = jest.fn((tournamentFormatId, tournamentStateId, eventFormatId) => ({
            eventFormatId,
            tournamentFormatId,
            tournamentStateId,
            awards: [],
            currentRoundIdx: -1,
            eventStateRoundStateId: undefined
        }));
        const getEventCompetitorsMock = jest.fn(() => ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "c11"]);
        const createRoundStateMock = jest.fn((tournamentFormatId, tournamentStateId, eventFormatId, eventStateId) => ({
            tournamentFormatId,
            tournamentStateId,
            eventFormatId,
            eventStateId,
            assigned: [],
            started: [],
            completed: [],
            queued: []
        }));
        const writeRoundStateMock = jest.fn((roundState) => roundState);
        const startGroupsMock = jest.fn(() => { });
        const updateTournamentStateEventStateIdMock = jest.fn(() => { });
        const updateEventStateRoundStateIdMock = jest.fn(() => { });

        queries.getEventFormat.mockImplementation(getEventFormatMock);
        queries.createEventState.mockImplementation(createEventStateMock);
        queries.getEventCompetitors.mockImplementation(getEventCompetitorsMock);
        queries.createRoundState.mockImplementation(createRoundStateMock);
        queries.writeRoundState.mockImplementation(writeRoundStateMock);
        queries.startGroups.mockImplementation(startGroupsMock);
        queries.updateTournamentStateEventStateId.mockImplementation(updateTournamentStateEventStateIdMock);
        queries.updateEventStateRoundStateId.mockImplementation(updateEventStateRoundStateIdMock);

        const { statusCode, body } = await handlers.startRounds({ tournamentStateId: "ts123", eventFormatId: "ef123" });
        expect(JSON.parse(body)).toEqual({
            roundState: {
                tournamentStateId: "ts123",
                eventFormatId: "ef123",
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
            eventState: { eventFormatId: "ef123", tournamentStateId: "ts123", awards: [], currentRoundIdx: 0 }
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

describe("completeRound", () => { });