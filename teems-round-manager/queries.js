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
  if (
    eventFormatResponse.errorMsg ||
    !eventFormatResponse?.data?.getEventFormat ||
    eventFormatResponse?.data?.getEventFormat?._deleted === true
  ) {
    return {};
  }
  const eventFormatData = { ...(eventFormatResponse?.data?.getEventFormat ?? {}) };
  eventFormatData.awards = eventFormatData.awards.map((award) => JSON.parse(award));
  eventFormatData.rounds = eventFormatData.rounds.map((round) => JSON.parse(round));
  return eventFormatData;
};

export const createEventState = async (tournamentFormatId, tournamentStateId, eventFormatId, currentRoundIdx) => {
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
    currentRoundIdx,
    awards: []
  };

  const eventStateResponse = await appSyncRequestMaker({ query, variables });
  if (eventStateResponse.errorMsg || !eventStateResponse?.data?.createEventState) {
    return {};
  }
  const eventState = { ...(eventStateResponse?.data?.createEventState ?? {}) };
  if (eventState?.awards?.map) eventState.awards = eventState.awards.map((award) => JSON.parse(award));
  return eventState;
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
  const roundState = { ...(roundStateResponse?.data?.createRoundState ?? {}) };
  if (roundState?.queued?.map) roundState.queued = roundState.queued.map((group) => JSON.parse(group));
  return roundState;
};

export const getTournamentStateOnly = async (tournamentStateId) => {
  const query = `query GetTournamentState($tournamentStateId: ID!) {
    getTournamentState(id: $tournamentStateId) {
      id
      judges
      tournamentFormatId
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
  const tournamentState = { ...(tournamentStateResponse?.data?.getTournamentState ?? {}) };
  if (tournamentState?.judges?.map) tournamentState.judges = tournamentState.judges.map((judge) => JSON.parse(judge));
  if (tournamentState?.competitors?.map)
    tournamentState.competitors = tournamentState.competitors.map((competitor) => JSON.parse(competitor));
  return tournamentState;
};

export const getTournamentStateEventStates = async (tournamentStateId) => {
  const query = `query GetTournamentStateEventStates($tournamentStateId: ID!) {
    getTournamentState(id: $tournamentStateId) {
      _version
      _lastChangedAt
      _deleted
      tournamentFormatId
      eventState {
        items {
          _version
          _lastChangedAt
          _deleted
          id
          eventFormatId
        }
      }
    }
  }`;
  const variables = { tournamentStateId };
  const tournamentStateResponse = await appSyncRequestMaker({ query, variables });
  if (tournamentStateResponse.errorMsg || !tournamentStateResponse?.data?.getTournamentState) {
    return {};
  }
  const tournamentState = { ...tournamentStateResponse?.data?.getTournamentState };
  if (tournamentState?.eventState?.items?.filter)
    tournamentState.eventState.items = tournamentState?.eventState?.items?.filter((item) => item._deleted !== true);
  return tournamentState;
};

export const getRoundState = async (roundStateId) => {
  const query = `query GetRoundState($roundStateId: ID!) {
    getRoundState(id: $roundStateId) {
      _deleted
      _lastChangedAt
      _version
      assigned
      completed
      eventFormatId
      eventStateId
      id
      queued
      started
      tournamentFormatId
      tournamentStateId
    }
  }`;
  const variables = { roundStateId };
  const roundStateResponse = await appSyncRequestMaker({ query, variables });
  if (roundStateResponse.errorMsg || !roundStateResponse?.data?.getRoundState) {
    return {};
  }
  return roundStateResponse?.data?.getRoundState;
};

export const getEventState = async (eventStateId) => {
  const query = `query GetEventState($eventStateId: ID!) {
    getEventState(id: $eventStateId) {
      _deleted
      _lastChangedAt
      _version
      awards
      currentRoundIdx
      eventFormatId
      id
      tournamentFormatId
      tournamentStateId
    }
  }`;
  const variables = { eventStateId };
  const eventStateResponse = await appSyncRequestMaker({ query, variables });
  if (eventStateResponse.errorMsg || !eventStateResponse?.data?.getEventState) {
    return {};
  }
  const eventState = { ...(eventStateResponse?.data?.getEventState ?? {}) };
  if (eventState?.awards?.map) eventState.awards = eventState.awards.map((award) => JSON.parse(award));
  return eventState;
};

export const updateEventStateAward = async (eventStateId, awardStrings, version) => {
  const awards = awardStrings.map((awardString) => JSON.stringify(awardString));
  const query = `mutation UpdateEventState($eventStateId: ID!, $awards: [AWSJSON], $version: Int) {
    updateEventState(input: {id: $eventStateId, _version: $version, awards: $awards}) {
      _deleted
      _lastChangedAt
      _version
      awards
      currentRoundIdx
      eventFormatId
      id
      tournamentFormatId
      tournamentStateId
    }
  }`;
  const variables = { eventStateId, awards, version };
  const eventStateResponse = await appSyncRequestMaker({ query, variables });
  if (eventStateResponse.errorMsg || !eventStateResponse?.data?.updateEventState) {
    return {};
  }
  const eventState = { ...(eventStateResponse?.data?.updateEventState ?? {}) };
  if (eventState?.awards?.map) eventState.awards = eventState.awards.map((award) => JSON.parse(award));
  return eventState;
};

export const getEventStateRoundStates = async (eventStateId) => {
  const query = `query GetEventStateRoundStates($eventStateId: ID!) {
    getEventState(id: $eventStateId) {
      roundState {
        items {
          _version
          _lastChangedAt
          _deleted
          assigned
          completed
          eventFormatId
          eventStateId
          id
          queued
          started
          tournamentFormatId
          tournamentStateId
        }
      }
    }
  }`;
  const variables = { eventStateId };
  const eventStateResponse = await appSyncRequestMaker({ query, variables });
  if (eventStateResponse.errorMsg || !eventStateResponse?.data?.getEventState?.roundState?.items) {
    return {};
  }
  const roundStates = [...(eventStateResponse?.data?.getEventState?.roundState?.items ?? [])];
  return roundStates
    .filter((roundState) => roundState !== true)
    .map((roundState) => ({
      ...roundState,
      queued: roundState?.queued?.map?.((group) => JSON.parse(group)) ?? roundState.queued,
      assigned: roundState?.assigned?.map?.((group) => JSON.parse(group)) ?? roundState.assigned,
      started: roundState?.started?.map?.((group) => JSON.parse(group)) ?? roundState.started,
      completed: roundState?.completed?.map?.((group) => JSON.parse(group)) ?? roundState.completed
    }));
};

export const startGroups = async (roundId) => {};
export const getEventCompetitors = async (eventFormatId) => {
  return ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "cg", "c0", "ch"];
};
export const completeEvent = async (eventFormatId, eventStateId) => {};
