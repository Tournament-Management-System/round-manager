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
    queries.getTournamentStateOnly(tournamentStateId)
  ]);

  if (tournamentState.tournamentStateEventStateId) {
    return respBuilder(400, {
      error: `event state has been initiated with ID "${tournamentState.tournamentStateEventStateId}"`
    });
  }

  const { tournamentFormatId } = eventFormat;
  const eventState = await queries.createEventState(tournamentFormatId, tournamentStateId, eventFormatId);
  const queued = eventUtils.assignNextRound(eventFormat, eventState, competitors);

  if (queued?.length) {
    const [roundState] = await Promise.all([
      queries.createRoundStateWithQueued(tournamentFormatId, tournamentStateId, eventFormatId, eventState.id, queued),
      queries.writeEventStateIdIntoTournamentState(tournamentStateId, eventState.id, tournamentState._version)
    ]);

    await queries.startGroups(roundState.id);
    return respBuilder(200, { roundState, eventState });
  } else {
    return respBuilder(400, { error: `unable to make assignment, queued is "${queued}"` });
  }
};

export const completeRound = () => {
  return respBuilder(200, "/completeRound");
};