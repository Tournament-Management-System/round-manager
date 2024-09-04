export const assignNextRound = (eventFormat, eventState, competitors) => {
  const previousRoundIdx = eventState.currentRoundIdx;

  eventState.currentRoundIdx += 1;

  if (eventState.currentRoundIdx >= eventFormat.rounds.length) {
    return {
      error: "fn assignNextRound: all rounds have been assigned"
    };
  }

  let competitorsToAssign = competitors;
  if (previousRoundIdx > -1) {
    competitorsToAssign = getGroupRankings(
      eventState.rounds,
      eventState.previousRoundIdx,
      eventFormat.rounds[previousRoundIdx].judgingCriteria
    );
  }
  return assignGroups(eventState, eventFormat, competitorsToAssign);
};

function assignGroups(eventState, eventMetaData, competitors) {
  const roundMetaData = eventMetaData.rounds[eventState.currentRoundIdx];

  if (roundMetaData.competitorLimit && roundMetaData.groupLimit) {
    const maxCompetitors = roundMetaData.competitorLimit * roundMetaData.groupLimit;
    let competitorsToAssign = competitors.slice(0, maxCompetitors);

    const queuedGroups = [];
    for (let groupIdx = 0; groupIdx < roundMetaData.groupLimit; groupIdx++) {
      queuedGroups.push(assignGroup(groupIdx, roundMetaData.competitorLimit, competitorsToAssign));
    }
    return queuedGroups;
  }
  if (roundMetaData.competitorLimit) {
    let competitorsToAssign = competitors;

    const queuedGroups = [];

    let groupIdx = 0;
    while (competitorsToAssign.length > 0) {
      queuedGroups.push(assignGroup(groupIdx++, roundMetaData.competitorLimit, competitorsToAssign));
    }
    return queuedGroups;
  }
  if (roundMetaData.groupLimit) {
    let competitorsToAssign = competitors;
    const queuedGroups = [];
    const regularGroupSize = Math.ceil(competitorsToAssign.length / roundMetaData.groupLimit);

    let groupIdx = 0;
    while (competitorsToAssign.length > 0) {
      queuedGroups.push(assignGroup(groupIdx++, regularGroupSize, competitorsToAssign));
    }
    return queuedGroups;
  }
}

function assignGroup(groupIdx, groupSize, competitorsToAssign) {
  if (competitorsToAssign?.slice && groupSize) {
    const currentGroupCompetitor = competitorsToAssign.slice(0, groupSize);
    for (let shiftIdx = 0; shiftIdx < groupSize; shiftIdx++) {
      competitorsToAssign.shift();
    }

    const ranking = {},
      comments = {};
    currentGroupCompetitor.forEach((competitorId) => {
      ranking[competitorId] = null;
      comments[competitorId] = null;
    });

    return {
      groupId: groupIdx,
      judges: [],
      competitors: currentGroupCompetitor,
      ranking,
      comments
    };
  }
}

function getGroupRankings(roundInfo, roundIdx, judgingCriteria) {
  if (judgingCriteria) {
    if (judgingCriteria === "highest_this_round") {
      return getRankFromRoundInfo(roundInfo, roundIdx);
    }
    if (judgingCriteria === "highest_all_round") {
      return getRankFromRoundInfo(roundInfo);
    }
  }
  return getRankFromRoundInfo(roundInfo);
}

export function tabulateEventResults(eventMetaData, eventState) {
  if (eventMetaData?.awards && eventState?.rounds) {
    const roundInfo = eventState.rounds;
    eventState.awards = [...(eventMetaData?.awards ?? [])];
    eventState.awards.forEach((award) => {
      let competitorRankingAward = [];
      if (award.awardCriteria === "highest_last_round") {
        const competitorIdRanked = getRankFromRoundInfo(roundInfo, Object.keys(roundInfo).length - 1);
        competitorRankingAward = competitorIdRanked.slice(0, award.numWinners);
      } else if (award.awardCriteria === "highest_all_rounds") {
        const competitorIdRanked = getRankFromRoundInfo(roundInfo);
        competitorRankingAward = competitorIdRanked.slice(0, award.numWinners);
      }
      award.winners = competitorRankingAward;
    });
    return eventState.awards;
  }
}

function getRankFromRoundInfo(roundInfo, roundIdx) {
  if (roundInfo) {
    const competitorMap = {};
    if (roundIdx !== null && roundIdx !== undefined) {
      roundInfo[roundIdx].completed.forEach((group) => {
        computeCompetitorMap(group.competitors, group.ranking, competitorMap);
      });
      return Object.keys(competitorMap).sort((cId1, cId2) => (competitorMap[cId1] < competitorMap[cId2] ? 1 : -1));
    }

    Object.keys(roundInfo).forEach((roundIndex) => {
      roundInfo[roundIndex].completed.forEach((group) => {
        computeCompetitorMap(group.competitors, group.ranking, competitorMap);
      });
    });
    return Object.keys(competitorMap).sort((cId1, cId2) => (competitorMap[cId1] < competitorMap[cId2] ? 1 : -1));
  }
}

function computeCompetitorMap(competitors, ranking, competitorMap) {
  if (competitorMap && ranking && competitors?.forEach) {
    competitors.forEach((competitor) => {
      if (!competitorMap[competitor]) competitorMap[competitor] = 0;
      competitorMap[competitor] += ranking[competitor] ?? 0;
    });
  }
}
