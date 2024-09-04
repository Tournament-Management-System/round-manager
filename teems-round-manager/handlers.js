import { respBuilder } from "./utils.js";
import * as queries from "./queries.js";
import * as eventUtils from "./eventUtils.js";

export const startRounds = async (body) => {
  if (!body) return respBuilder(400, { error: `invalid request body - missing body` });
  if (!body.tournamentStateId) return respBuilder(400, { error: `invalid request body - missing tournamentStateId` });
  if (!body.eventFormatId) return respBuilder(400, { error: `invalid request body - missing eventFormatId` });

  const { eventFormatId, tournamentStateId } = body;

  const [eventFormat, tournamentState] = await Promise.all([
    queries.getEventFormat(eventFormatId),
    queries.getTournamentStateEventStates(tournamentStateId)
  ]);
  const competitors = await queries.getEventCompetitors(tournamentState.tournamentFormatId, eventFormatId);

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
  if (!queued) {
    return respBuilder(400, { error: `queued is falsy: "${queued}"` });
  }
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
  console.log("\ncompleteRound: call initiated");
  if (!body) return respBuilder(400, { error: `invalid request body - missing body` });
  if (!body.roundStateId) return respBuilder(400, { error: `invalid request body - missing roundStateId` });

  console.log("\ncompleteRound: input validated\n" + JSON.stringify(body));

  const roundState = await queries.getRoundState(body.roundStateId);
  console.log("\ncompleteRound: round state retrieved\n" + JSON.stringify(roundState));
  if (roundState.queued?.length !== 0 || roundState?.assigned?.length !== 0 || roundState?.started?.length !== 0) {
    return respBuilder(400, { error: "round not finished - not all groups have completed", roundState });
  }

  const [eventState, eventFormat] = await Promise.all([
    queries.getEventStateWithRounds(roundState.eventStateId),
    queries.getEventFormat(roundState.eventFormatId)
  ]);

  if (eventState.currentRoundIdx === eventFormat.rounds.length - 1) {
    const awards = eventUtils.tabulateEventResults(eventFormat, eventState);
    console.log("completeRound: awards" + JSON.stringify(awards));
    const newEventState = await queries.updateEventStateAward(eventState.id, awards, eventState._version);
    await queries.completeEvent(roundState.eventStateId);
    return respBuilder(200, { roundState, eventState: newEventState });
  } else {
    const [competitors, eventRoundStates] = await Promise.all([
      queries.getEventCompetitors(roundState.eventFormatId),
      queries.getEventStateRoundStates(roundState.eventStateId)
    ]);

    const queued = eventUtils.assignNextRound(eventFormat, eventState, competitors, eventRoundStates);
    if (queued?.length) {
      console.log("\ncompleteRound: start round state creation");
      const nextRoundState = await queries.createRoundStateWithQueued(
        roundState.tournamentFormatId,
        roundState.tournamentStateId,
        roundState.eventFormatId,
        roundState.eventStateId,
        queued
      );
      console.log("\ncompleteRound: new round state created\n" + JSON.stringify(nextRoundState));
      const newEventState = await queries.updateEventStateIndex(
        eventState.id,
        eventState.currentRoundIdx,
        eventState._version
      );
      await queries.startGroups(nextRoundState.id);
      return respBuilder(200, { roundState: nextRoundState, eventState: newEventState });
    }
    return respBuilder(400, { error: `unable to make assignment, queued is "${queued}"` });
  }
};
