const { respBuilder } = require("./utils");
const queries = require("./queries");
const eventUtils = require("./eventUtils");

const startRounds = async (body) => {
    if (!body) return respBuilder(400, { error: `invalid request body - missing body` });
    if (!body.tournamentStateId) return respBuilder(400, { error: `invalid request body - missing tournamentStateId` });
    if (!body.eventFormatId) return respBuilder(400, { error: `invalid request body - missing eventFormatId` });

    const { eventFormatId, tournamentStateId } = body;

    const [eventFormat, competitors] = await Promise.all([
        queries.getEventFormat(eventFormatId),
        queries.getEventCompetitors(eventFormatId)
    ]);

    const eventState = await queries.createEventState(eventFormat.tournamentFormatId, tournamentStateId, eventFormatId);
    const roundState = await queries.createRoundState(
        eventFormat.tournamentFormatId,
        tournamentStateId,
        eventFormatId,
        eventState.id
    );

    const queuedRounds = eventUtils.assignNextRound(eventFormat, eventState, competitors);
    roundState.queued = queuedRounds;

    await queries.writeRoundState(roundState.id, roundState);

    await Promise.all([
        queries.updateTournamentStateEventStateId(tournamentStateId, eventState.id),
        queries.updateEventStateRoundStateId(eventState.id, roundState.id)
    ]);

    await queries.startGroups(roundState.id);
    return respBuilder(200, { roundState, eventState });
};

const completeRound = () => {
    return respBuilder(200, "/completeRound");
};

module.exports = {
    startRounds,
    completeRound
};