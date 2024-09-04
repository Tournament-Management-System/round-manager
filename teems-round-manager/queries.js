const getEventFormat = async (eventFormatId) => { };
const createEventState = async (tournamentFormatId, tournamentStateId, eventFormatId) => { };
const getEventCompetitors = async (eventFormatId) => { };
const createRoundState = async (tournamentFormatId, tournamentStateId, eventFormatId, eventStateId) => { };
const writeRoundState = async (roundStateId, roundState) => { };
const startGroups = async (roundId) => { };
const updateTournamentStateEventStateId = async (tournamentStateId, eventStateId) => { };
const updateEventStateRoundStateId = async (eventStateId, roundStateId) => { };

module.exports = {
    getEventFormat,
    createEventState,
    getEventCompetitors,
    createRoundState,
    writeRoundState,
    startGroups,
    updateTournamentStateEventStateId,
    updateEventStateRoundStateId
};