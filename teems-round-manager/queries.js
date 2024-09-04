import { appSyncRequestMaker } from "./utils.js";

export const getEventFormat = async (eventFormatId) => {
    const query = `query QueryEventFormat($eventFormatId: ID!) {
      getEventFormat(id: $eventFormatId) {
        id
        name
        owner
        awards
        rounds
        _deleted
        _lastChangedAt
        _version
      }
    }
  `;
    const variables = {
        eventFormatId
    };

    const eventFormatResponse = await appSyncRequestMaker({ query, variables });
    if (eventFormatResponse.errorMsg || !eventFormatResponse?.data?.getEventFormat) {
        return {};
    }
    const eventFormatData = eventFormatResponse?.data?.getEventFormat;
    eventFormatData.awards = eventFormatData.awards.map((award) => JSON.parse(award));
    eventFormatData.rounds = eventFormatData.rounds.map((round) => JSON.parse(round));
    return eventFormatData;
};

export const createEventState = async (tournamentFormatId, tournamentStateId, eventFormatId) => {
    const query = `
  mutation CreateEventState($tournamentFormatId: ID!, $tournamentStateId: ID!, $eventFormatId: ID!, $awards: [AWSJSON], $currentRoundIdx: Int!) {
    createEventState(input: {tournamentFormatId: $tournamentFormatId, tournamentStateId: $tournamentStateId, eventFormatId: $eventFormatId, awards: $awards, currentRoundIdx: $currentRoundIdx}) {
      _deleted
      _lastChangedAt
      _version
      id
      eventFormatId
      currentRoundIdx
      awards
      tournamentFormatId
      tournamentStateId
    }
  }`;
    const variables = {
        tournamentFormatId,
        tournamentStateId,
        eventFormatId,
        currentRoundIdx: -1,
        awards: []
    };

    const eventStateResponse = await appSyncRequestMaker({ query, variables });
    if (eventStateResponse.errorMsg || !eventStateResponse?.data?.createEventState) {
        return {};
    }
    return eventStateResponse?.data?.createEventState;
};

export const createRoundStateWithQueued = async (
    tournamentFormatId,
    tournamentStateId,
    eventFormatId,
    eventStateId,
    queued
) => {
    const queuedGroups = queued.map((round) => JSON.stringify(round));
    const query = `mutation CreateRoundState($eventFormatId: ID!, $tournamentFormatId: ID!, $tournamentStateId: ID!, $eventStateId: ID!, $emptyGroups: [AWSJSON], $queuedGroups: [AWSJSON]) {
    createRoundState(input: {eventFormatId: $eventFormatId, tournamentFormatId: $tournamentFormatId, tournamentStateId: $tournamentStateId, eventStateId: $eventStateId, assigned: $emptyGroups, completed: $emptyGroups, started: $emptyGroups, queued: $queuedGroups}) {
      _deleted
      _version
      _lastChangedAt
      id
      queued
      started
      tournamentFormatId
      tournamentStateId
      eventStateId
      eventFormatId
      completed
      assigned
    }
  }
  `;
    const variables = {
        tournamentFormatId,
        tournamentStateId,
        eventFormatId,
        eventStateId,
        queuedGroups,
        emptyGroups: []
    };
    const roundStateResponse = await appSyncRequestMaker({ query, variables });
    if (roundStateResponse.errorMsg || !roundStateResponse?.data?.createRoundState) {
        return {};
    }
    return roundStateResponse?.data?.createRoundState;
};

export const getTournamentStateOnly = async (tournamentStateId) => {
    const query = `query GetTournamentState($tournamentStateId: ID!) {
    getTournamentState(id: $tournamentStateId) {
      id
      judges
      tournamentFormatId
      tournamentStateEventStateId
      competitors
      eventFormatIds
      _deleted
      _lastChangedAt
      _version
    }
  }`;
    const variables = { tournamentStateId };
    const tournamentStateResponse = await appSyncRequestMaker({ query, variables });
    if (tournamentStateResponse.errorMsg || !tournamentStateResponse?.data?.getTournamentState) {
        return {};
    }
    return tournamentStateResponse?.data?.getTournamentState;
};

export const startGroups = async (roundId) => { };
export const getEventCompetitors = async (eventFormatId) => {
    return ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "cg", "c0", "ch"];
};