import { respBuilder } from "./utils.js";
import * as queries from "./queries.js";
import * as eventUtils from "./eventUtils.js";

export const startRounds = async (body) => {
  if (!body) return respBuilder(400, { error: `invalid request body - missing body` });
  if (!body.tournamentStateId) return respBuilder(400, { error: `invalid request body - missing tournamentStateId` });
  if (!body.eventFormatId) return respBuilder(400, { error: `invalid request body - missing eventFormatId` });

  const { eventFormatId, tournamentStateId } = body;

  const [eventFormat, competitors, tournamentState] = await Promise.all([
    queries.getEventFormat(eventFormatId),
    queries.getEventCompetitors(eventFormatId),
    queries.getTournamentStateEventStates(tournamentStateId)
  ]);

  const { tournamentFormatId } = tournamentState;
  const eventStateInTournamentState = tournamentState?.eventState?.items?.find?.(
    (_eventState) => _eventState.eventFormatId === eventFormatId
  );
  if (eventStateInTournamentState) {
    return respBuilder(400, {
      error: `eventFormatId "${eventFormatId}" has been initiated with eventStateId "${eventStateInTournamentState.id}"`
    });
  }

  const rawEventState = {
    tournamentFormatId,
    tournamentStateId,
    eventFormatId,
    currentRoundIdx: -1,
    awards: []
  };
  const queued = eventUtils.assignNextRound(eventFormat, rawEventState, competitors);
  const eventState = await queries.createEventState(
    rawEventState.tournamentFormatId,
    rawEventState.tournamentStateId,
    rawEventState.eventFormatId,
    rawEventState.currentRoundIdx
  );

  if (queued?.length) {
    const roundState = await queries.createRoundStateWithQueued(
      tournamentFormatId,
      tournamentStateId,
      eventFormatId,
      eventState.id,
      queued
    );

    await queries.startGroups(roundState.id);
    return respBuilder(200, { roundState, eventState });
  } else {
    return respBuilder(400, { error: `unable to make assignment, queued is "${queued}"` });
  }
};

export const completeRound = async (body) => {
  if (!body) return respBuilder(400, { error: `invalid request body - missing body` });
  if (!body.roundStateId) return respBuilder(400, { error: `invalid request body - missing roundStateId` });

  const roundState = await queries.getRoundState(body.roundStateId);
  if (roundState.queued?.length !== 0 || roundState?.assigned?.length !== 0 || roundState?.started?.length !== 0) {
    return respBuilder(400, { error: "round not finished - not all groups have completed" });
  }

  const [eventState, eventFormat] = await Promise.all([
    queries.getEventState(roundState.eventStateId),
    queries.getEventFormat(roundState.eventFormatId)
  ]);

  if (eventState.currentRoundIdx === eventFormat.rounds.length - 1) {
    const awards = eventUtils.tabulateEventResults(eventFormat, eventState);
    const newEventState = await queries.updateEventStateAward(roundState.id, awards, eventState._version);
    await queries.completeEvent(roundState.eventFormatId, roundState.eventStateId);
    return respBuilder(200, { roundState, eventState: newEventState });
  } else {
    const [competitors, eventRoundStates] = await Promise.all([
      queries.getEventCompetitors(roundState.eventFormatId),
      queries.getEventStateRoundStates(roundState.eventStateId)
    ]);

    const queued = eventUtils.assignNextRound(eventFormat, eventState, competitors, eventRoundStates);
    if (queued?.length) {
      const nextRoundState = await queries.createRoundStateWithQueued(
        roundState.tournamentFormatId,
        roundState.tournamentStateId,
        roundState.eventFormatId,
        roundState.eventStateId,
        queued
      );
      await queries.startGroups(nextRoundState.id);
      return respBuilder(200, { roundState: nextRoundState, eventState });
    }
    return respBuilder(400, { error: `unable to make assignment, queued is "${queued}"` });
  }
};
