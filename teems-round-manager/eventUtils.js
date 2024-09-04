export const assignNextRound = (eventFormat, eventState, competitors, roundState) => {
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
      roundState,
      previousRoundIdx,
      eventFormat.rounds[previousRoundIdx].judgingCriteria
    );
  }
  return assignGroups(eventState, eventFormat, competitorsToAssign);
};

export function assignGroups(eventState, eventFormat, competitors) {
  const roundMetaData = eventFormat.rounds[eventState.currentRoundIdx];
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

export function assignGroup(groupIdx, groupSize, competitorsToAssign) {
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
      comments,
      roomId: null
    };
  }
}

export function getGroupRankings(roundInfo, roundIdx, judgingCriteria) {
  if (judgingCriteria === "highest_this_round") {
    return getRankFromRoundInfo(roundInfo, roundIdx);
  }
  return getRankFromRoundInfo(roundInfo);
}

export function tabulateEventResults(eventFormat, eventState) {
  if (eventFormat?.awards && eventState?.roundState) {
    const roundInfo = eventState.roundState.items;
    eventState.awards = [...(eventFormat?.awards ?? [])];
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

export function getRankFromRoundInfo(roundInfo, roundIdx) {
  if (roundInfo) {
    const competitorMap = {};
    if (roundIdx !== null && roundIdx !== undefined) {
      const roundInfoSorted = [...roundInfo];
      roundInfoSorted.sort((a, b) => (new Date(a.createdAt) < new Date(b.createdAt) ? -1 : 1));
      roundInfoSorted[roundIdx].completed.forEach((group) => {
        computeCompetitorMap(group.competitors, group.ranking, competitorMap);
      });
      console.log("getRankFromRoundInfo: from this round" + JSON.stringify(roundInfoSorted[roundIdx]));
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

export function computeCompetitorMap(competitors, ranking, competitorMap) {
  if (competitorMap && ranking && competitors?.forEach) {
    competitors.forEach((competitor) => {
      if (!competitorMap[competitor]) competitorMap[competitor] = 0;
      competitorMap[competitor] += ranking[competitor] ?? 0;
    });
  }
}
