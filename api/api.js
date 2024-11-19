const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 * 60 * 24 }); // Cache for 1 day (86400 seconds)
const log = require('../utilities/log.js');

const suffix = d => {
	const last = d % 100;
	if (last > 3 && last < 21) return d + 'th';
	switch (last % 10) {
		case 1:
			return d + 'st';
		case 2:
			return d + 'nd';
		case 3:
			return d + 'rd';
		default:
			return d + 'th';
	}
};

// Function to fetch and cache data
const fetchAndCache = async (key, url) => {
	const cachedData = cache.get(key);
	if (cachedData) {
		return cachedData;
	} else {
		const response = await fetch(url);
		log(response, 'api');
		if (response.status !== 200) return null;
		const data = await response.json();
		cache.set(key, data);
		return data;
	}
};

const getTeam = async query => {
	if (query.match(/^[0-9]+$/)) {
		const team = await fetchAndCache(`team_${query}`, `https://ctftime.org/api/v1/teams/${query}/`);
		return team;
	} else {
		const team = await fetch(`https://ctftime.org/team/list/?q=${encodeURIComponent(query)}`);
		if (team.url) {
			const teamId = team.url.split('team/')[1];
			const res = await fetchAndCache(`team_${teamId}`, `https://ctftime.org/api/v1/teams/${teamId}/`);
			return res;
		} else {
			return null;
		}
	}
};

const getEventsByTeam = async team => {
	const currentYear = new Date().getUTCFullYear();
	const startOfYear = new Date(Date.UTC(currentYear, 0, 1)).getTime() / 1000; // First millisecond of the current year
	const endOfYear = new Date(Date.UTC(currentYear + 1, 0, 1)).getTime() / 1000 - 1; // Last millisecond of the current year

	// Fetch and cache event results for the current year
	const events = await fetchAndCache(`results_${currentYear}`, `https://ctftime.org/api/v1/results/${currentYear}/`);
	if (!events) return null;

	// Fetch and cache events for the current year
	const times = await fetchAndCache(
		`events_${currentYear}`,
		`https://ctftime.org/api/v1/events/?limit=1000&start=${startOfYear}&finish=${endOfYear}`,
	);
	if (!times) return null;

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
				percentage: (teamScore.place / event.scores.length) * 100,
			});
		}
	}

	if (teamEvents.some(event => times.find(time => time.id == event.eventId)?.start == undefined)) {
		return null;
	}

	teamEvents.sort((a, b) => {
		const aTime = new Date(times.find(time => time.id == a.eventId).start);
		const bTime = new Date(times.find(time => time.id == b.eventId).start);
		return aTime - bTime;
	});

	return teamEvents;
};

const getUpcomingEvents = async () => {
	const currentYear = new Date().getUTCFullYear();
	const events = await fetchAndCache(`events_${currentYear}`, `https://ctftime.org/api/v1/events/?limit=1000`);
	if (!events) return null;
	const startDate = new Date();
	startDate.setDate(startDate.getDate() + ((1 - startDate.getDay()) % 7));
	startDate.setHours(3, 0, 0, 0);
	const endDate = new Date(startDate);
	endDate.setDate(new Date().getDate() + 8);
	endDate.setHours(3, 0, 0, 0);

	const upcomingEvents = events.filter(event => {
		const startTime = new Date(event.start);
		console.log(event);
		return (
			startTime >= startDate && startTime <= endDate && (!event.onsite || event.location.includes('Online') || event.location == '')
		);
	});
	return upcomingEvents || null;
};
module.exports = {
	getTeam,
	getEventsByTeam,
	getUpcomingEvents,
	suff: suffix,
};
