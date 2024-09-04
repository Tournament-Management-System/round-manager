import {
  assignNextRound,
  assignGroup,
  assignGroups,
  getGroupRankings,
  getRankFromRoundInfo,
  computeCompetitorMap
} from "../teems-round-manager/eventUtils.js";

describe("computeCompetitorMap", () => {
  test("works with 1 group ranking", () => {
    const competitors = ["cid1", "cid2", "cid3"];
    const rankings = {
      cid1: 7,
      cid2: 8,
      cid3: 3
    };
    const competitorMap = {};
    computeCompetitorMap(competitors, rankings, competitorMap);
    expect(competitorMap).toEqual({
      cid1: 7,
      cid2: 8,
      cid3: 3
    });
  });

  test("works with 2 group ranking", () => {
    const competitors = ["cid1", "cid2", "cid3"];
    const rankings1 = {
      cid1: 1,
      cid2: 2,
      cid3: 3
    };
    const rankings2 = {
      cid1: 1,
      cid2: 2,
      cid3: 3
    };
    const competitorMap = {};
    computeCompetitorMap(competitors, rankings1, competitorMap);
    computeCompetitorMap(competitors, rankings2, competitorMap);
    expect(competitorMap).toEqual({
      cid1: 2,
      cid2: 4,
      cid3: 6
    });
  });

  test("works when ranking is missing", () => {
    const competitors = ["cid1", "cid2", "cid3"];
    const rankings1 = {
      cid1: 1,
      cid2: 2
    };
    const competitorMap = {};
    computeCompetitorMap(competitors, rankings1, competitorMap);
    expect(competitorMap).toEqual({
      cid1: 1,
      cid2: 2,
      cid3: 0
    });
  });

  test("works when ranking is missing sometimes", () => {
    const competitors = ["cid1", "cid2", "cid3"];
    const rankings1 = {
      cid1: 1,
      cid2: 2,
      cid3: 3
    };
    const rankings2 = {
      cid1: 1,
      cid2: 2
    };
    const competitorMap = {};
    computeCompetitorMap(competitors, rankings1, competitorMap);
    computeCompetitorMap(competitors, rankings2, competitorMap);
    expect(competitorMap).toEqual({
      cid1: 2,
      cid2: 4,
      cid3: 3
    });
  });

  test("handle undefined inputs", () => {
    computeCompetitorMap();
  });
});

describe("getRankFromRoundInfo", () => {
  test("getting rank where there is only 1 round but asks for all rounds", () => {
    const roundInfo = {
      1: {
        completed: [
          {
            competitors: ["cid1", "cid2", "cid3"],
            ranking: {
              cid1: 1,
              cid2: 2,
              cid3: 3
            }
          },
          {
            competitors: ["cid4", "cid5", "cid6"],
            ranking: {
              cid4: 4,
              cid5: 5,
              cid6: 6
            }
          }
        ]
      }
    };
    const ranking = getRankFromRoundInfo(roundInfo);
    expect(ranking).toEqual(["cid6", "cid5", "cid4", "cid3", "cid2", "cid1"]);
  });
  test("getting rank where there is 2 rounds but asks for 1", () => {
    const roundInfo = [
      {
        completed: [
          {
            competitors: ["cid1", "cid2", "cid3"],
            ranking: {
              cid1: 1,
              cid2: 2,
              cid3: 3
            }
          },
          {
            competitors: ["cid4", "cid5", "cid6"],
            ranking: {
              cid4: 4,
              cid5: 5,
              cid6: 6
            }
          }
        ],
        createdAt: "2023-03-05T19:11:27.842Z"
      },
      {
        createdAt: "2023-03-05T19:11:27.842Z",
        completed: [
          {
            competitors: ["cid7", "cid8", "cid9"],
            ranking: {
              cid7: 7,
              cid8: 8,
              cid9: 9
            }
          }
        ]
      }
    ];
    const ranking = getRankFromRoundInfo(roundInfo, 1);
    expect(ranking).toEqual(["cid9", "cid8", "cid7"]);
  });

  test("getting rank where there is 2 rounds but asks for all", () => {
    const roundInfo = {
      1: {
        completed: [
          {
            competitors: ["cid1", "cid2", "cid3"],
            ranking: {
              cid1: 1,
              cid2: 2,
              cid3: 3
            }
          },
          {
            competitors: ["cid4", "cid5", "cid6"],
            ranking: {
              cid4: 4,
              cid5: 5,
              cid6: 6
            }
          }
        ]
      },
      2: {
        completed: [
          {
            competitors: ["cid7", "cid8", "cid9"],
            ranking: {
              cid7: 7,
              cid8: 8,
              cid9: 9
            }
          }
        ]
      }
    };
    const ranking = getRankFromRoundInfo(roundInfo);
    expect(ranking).toEqual(["cid9", "cid8", "cid7", "cid6", "cid5", "cid4", "cid3", "cid2", "cid1"]);
  });

  test("getting rank from all rounds with same competitors", () => {
    const roundInfo = {
      1: {
        completed: [
          {
            competitors: ["cid1", "cid2", "cid3"],
            ranking: {
              cid1: 1,
              cid2: 2,
              cid3: 3
            }
          },
          {
            competitors: ["cid4", "cid5", "cid6"],
            ranking: {
              cid4: 4,
              cid5: 5,
              cid6: 6
            }
          }
        ]
      },
      2: {
        completed: [
          {
            competitors: ["cid1", "cid2", "cid3"],
            ranking: {
              cid1: 100000000,
              cid2: 2,
              cid3: 3
            }
          },
          {
            competitors: ["cid4", "cid5", "cid6"],
            ranking: {
              cid4: 4,
              cid5: 5,
              cid6: 6
            }
          }
        ]
      }
    };
    const ranking = getRankFromRoundInfo(roundInfo);
    expect(ranking).toEqual(["cid1", "cid6", "cid5", "cid4", "cid3", "cid2"]);
  });

  test("handle undefined inputs", () => {
    getRankFromRoundInfo();
  });
});

describe("getGroupRankings", () => {
  test("get group ranking from 2 rounds", () => {
    const eventState = {
      rounds: [
        {
          createdAt: "2023-03-05T19:11:27.842Z",
          completed: [
            {
              competitors: ["cid1", "cid2", "cid3"],
              ranking: {
                cid1: 1,
                cid2: 2,
                cid3: 10000
              }
            },
            {
              competitors: ["cid4", "cid5", "cid6"],
              ranking: {
                cid4: 4,
                cid5: 5,
                cid6: 6
              }
            }
          ]
        },
        {
          createdAt: "2023-03-05T19:12:27.842Z",
          completed: [
            {
              competitors: ["cid1", "cid2", "cid3"],
              ranking: {
                cid1: 10000,
                cid2: 2,
                cid3: 3
              }
            },
            {
              competitors: ["cid4", "cid5", "cid6"],
              ranking: {
                cid4: 4,
                cid5: 5,
                cid6: 6
              }
            }
          ]
        }
      ]
    };
    expect(getGroupRankings(eventState.rounds, 1, "highest_this_round")).toEqual([
      "cid1",
      "cid6",
      "cid5",
      "cid4",
      "cid3",
      "cid2"
    ]);
    expect(getGroupRankings(eventState.rounds, 0, "highest_this_round")).toEqual([
      "cid3",
      "cid6",
      "cid5",
      "cid4",
      "cid2",
      "cid1"
    ]);
    expect(getGroupRankings(eventState.rounds, undefined, "highest_all_rounds")).toEqual([
      "cid3",
      "cid1",
      "cid6",
      "cid5",
      "cid4",
      "cid2"
    ]);
    expect(getGroupRankings(eventState.rounds, 0)).toEqual(["cid3", "cid1", "cid6", "cid5", "cid4", "cid2"]);
    expect(getGroupRankings(eventState.rounds, undefined)).toEqual(["cid3", "cid1", "cid6", "cid5", "cid4", "cid2"]);
  });

  test("handle undefined inputs", () => {
    getGroupRankings();
  });
});

describe("assignGroup", () => {
  test("assign simple group", () => {
    let competitorsToAssign = ["c1", "c2", "c3", "c4", "c7"];
    const group1 = assignGroup(0, 2, competitorsToAssign);
    expect(group1).toEqual({
      competitors: ["c1", "c2"],
      groupId: 0,
      judges: [],
      ranking: { c1: null, c2: null },
      comments: { c1: null, c2: null },
      roomId: null
    });
    expect(competitorsToAssign).toEqual(["c3", "c4", "c7"]);

    const group2 = assignGroup(1, 2, competitorsToAssign);
    expect(group2).toEqual({
      competitors: ["c3", "c4"],
      groupId: 1,
      judges: [],
      ranking: { c3: null, c4: null },
      comments: { c3: null, c4: null },
      roomId: null
    });
    expect(competitorsToAssign).toEqual(["c7"]);

    const group3 = assignGroup(2, 2, competitorsToAssign);
    expect(group3).toEqual({
      competitors: ["c7"],
      groupId: 2,
      judges: [],
      ranking: { c7: null },
      comments: { c7: null },
      roomId: null
    });
    expect(competitorsToAssign).toEqual([]);
  });

  test("handle undefined inputs", () => {
    assignGroup();
  });
});

describe("assignGroups", () => {
  test("competitorLimit only", () => {
    const eventMetaData = {
      rounds: [
        {
          competitorLimit: 3
        }
      ]
    };
    const eventState = {
      currentRoundIdx: 0
    };
    const competitors = ["c1", "c2", "c3", "c4", "c5", "c6", "c7"];
    const queuedGroups = assignGroups(eventState, eventMetaData, competitors);
    expect(queuedGroups).toEqual([
      {
        competitors: ["c1", "c2", "c3"],
        groupId: 0,
        judges: [],
        ranking: { c1: null, c2: null, c3: null },
        comments: { c1: null, c2: null, c3: null },
        roomId: null
      },
      {
        competitors: ["c4", "c5", "c6"],
        groupId: 1,
        judges: [],
        ranking: { c4: null, c5: null, c6: null },
        comments: { c4: null, c5: null, c6: null },
        roomId: null
      },
      { competitors: ["c7"], groupId: 2, judges: [], ranking: { c7: null }, comments: { c7: null }, roomId: null }
    ]);
  });

  test("groupLimit only", () => {
    const eventMetaData = {
      rounds: [
        {
          groupLimit: 2
        }
      ]
    };
    const eventState = {
      currentRoundIdx: 0
    };
    const competitors = ["c1", "c2", "c3", "c4", "c5", "c6", "c7"];
    const queuedGroups = assignGroups(eventState, eventMetaData, competitors);
    expect(queuedGroups).toEqual([
      {
        competitors: ["c1", "c2", "c3", "c4"],
        groupId: 0,
        judges: [],
        ranking: { c1: null, c2: null, c3: null, c4: null },
        comments: { c1: null, c2: null, c3: null, c4: null },
        roomId: null
      },
      {
        competitors: ["c5", "c6", "c7"],
        groupId: 1,
        judges: [],
        ranking: { c5: null, c6: null, c7: null },
        comments: { c5: null, c6: null, c7: null },
        roomId: null
      }
    ]);
  });

  test("groupLimit and competitorLimit", () => {
    const eventMetaData = {
      rounds: [
        {
          groupLimit: 2,
          competitorLimit: 3
        }
      ]
    };
    const eventState = {
      currentRoundIdx: 0
    };
    const competitors = ["c1", "c2", "c3", "c4", "c5", "c6", "c7"];
    const queuedGroups = assignGroups(eventState, eventMetaData, competitors);
    expect(queuedGroups).toEqual([
      {
        competitors: ["c1", "c2", "c3"],
        groupId: 0,
        judges: [],
        ranking: { c1: null, c2: null, c3: null },
        comments: { c1: null, c2: null, c3: null },
        roomId: null
      },
      {
        competitors: ["c4", "c5", "c6"],
        groupId: 1,
        judges: [],
        ranking: { c4: null, c5: null, c6: null },
        comments: { c4: null, c5: null, c6: null },
        roomId: null
      }
    ]);
  });

  test("competitorLimit only not enough competitors", () => {
    const eventMetaData = {
      rounds: [
        {
          competitorLimit: 2
        }
      ]
    };
    const eventState = {
      currentRoundIdx: 0
    };
    const competitors = ["c1"];
    const queuedGroups = assignGroups(eventState, eventMetaData, competitors);
    expect(queuedGroups).toEqual([
      { competitors: ["c1"], groupId: 0, judges: [], ranking: { c1: null }, comments: { c1: null }, roomId: null }
    ]);
  });

  test("groupLimit only not enough competitors", () => {
    const eventMetaData = {
      rounds: [
        {
          groupLimit: 3
        }
      ]
    };
    const eventState = {
      currentRoundIdx: 0
    };
    const competitors = ["c1"];
    const queuedGroups = assignGroups(eventState, eventMetaData, competitors);
    expect(queuedGroups).toEqual([
      { competitors: ["c1"], groupId: 0, judges: [], ranking: { c1: null }, comments: { c1: null }, roomId: null }
    ]);
  });

  test("groupLimit and competitorLimit not enough competitors", () => {
    const eventMetaData = {
      rounds: [
        {
          groupLimit: 1,
          competitorLimit: 2
        }
      ]
    };
    const eventState = {
      currentRoundIdx: 0
    };
    const competitors = ["c1"];
    const queuedGroups = assignGroups(eventState, eventMetaData, competitors);
    expect(queuedGroups).toEqual([
      { competitors: ["c1"], groupId: 0, judges: [], ranking: { c1: null }, comments: { c1: null }, roomId: null }
    ]);
  });
});

describe("assignNextRound", () => {
  test("all rounds have been assigned", () => {
    expect(assignNextRound({ rounds: ["1", "2"] }, { currentRoundIdx: -1 })).not.toEqual({
      error: "fn assignNextRound: all rounds have been assigned"
    });
    expect(assignNextRound({ rounds: ["1", "2"] }, { currentRoundIdx: 0 })).not.toEqual({
      error: "fn assignNextRound: all rounds have been assigned"
    });
    expect(assignNextRound({ rounds: ["1", "2"] }, { currentRoundIdx: 1 })).toEqual({
      error: "fn assignNextRound: all rounds have been assigned"
    });
  });
});
