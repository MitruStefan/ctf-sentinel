//to-do: add caching
const getTeam = async query => {
	//https://ctftime.org/api/v1/teams/{team_id}/
	if (query.match(/^[0-9]+$/)) {
		const team = await fetch(`https://ctftime.org/api/v1/teams/${query}/`);
		if (team.status === 200) {
			return team.json();
		} else {
			return null;
		}
	} else {
		//not implemented yet
	}
};

const getEventsByTeam = async team => {
	//https://ctftime.org/api/v1/results/{year}/
	const response = await fetch(`https://ctftime.org/api/v1/results/${new Date().getUTCFullYear()}/`);

	if (response.status === 200) {
		const events = await response.json();
		const teamEvents = [];
		for (const eventId in events) {
			const event = events[eventId];
			const teamScore = event.scores.find(score => score.team_id == team);

			if (teamScore) {
				teamEvents.push({
					eventId,
					title: event.title,
					points: teamScore.points,
					place: teamScore.place,
				});
			}
		}
		return teamEvents;
	} else {
		return null;
	}
};

module.exports = {
	getTeam,
	getEventsByTeam,
};
