const djs = require('discord.js');
const { getTeam, getEventsByTeam } = require('../api/api.js');

module.exports.interaction = async interaction => {
	interaction.deferReply({ ephemeral: true });
	const query = interaction.options.getString('query');
	const team = await getTeam(query);
	if (!team) return interaction.editReply({ content: 'Team not found.' });
	const results = await getEventsByTeam(team.id);

	const embed = new djs.EmbedBuilder()
		.setColor(global.config.color)
		.setTitle(`${team.name}`)
		.setURL(`https://ctftime.org/team/${team.id}/`)
		.setThumbnail(team.logo);

	const rating = team.rating[new Date().getFullYear()];

	let events = '';
	let remainingEvents = 0;
	for (const event of results.reverse()) {
		const place = event.place;

		const eventString = `${place} [${event.title}](<https://ctftime.org/event/${event.eventId}>) ${event.points.slice(0, -5)}\n`;
		if (events.length + eventString.length > 1024) {
			remainingEvents++;
		} else {
			events += eventString;
		}
	}

	if (remainingEvents > 0) {
		events += `and ${remainingEvents} more...`;
	}
	if (rating) {
		const country_place = rating.country_place;
		let suffix = 'th';
		if (country_place % 100 < 11 || place % 100 > 13) {
			if (country_place % 10 == 1) suffix = 'st';
			else if (country_place % 10 == 2) suffix = 'nd';
			else if (country_place % 10 == 3) suffix = 'rd';
		}
		const global_place = rating.rating_place;
		let global_suffix = 'th';
		if (global_place % 100 < 11 || global_place % 100 > 13) {
			if (global_place % 10 == 1) global_suffix = 'st';
			else if (global_place % 10 == 2) global_suffix = 'nd';
			else if (global_place % 10 == 3) global_suffix = 'rd';
		}
		embed.setDescription(`
${team.name} is a team from :flag_${team.country.toLowerCase()}: that has participated in ${results.length} events in 2024.
They are ranked ${rating.country_place}${suffix} in their country and ${rating.rating_place}${global_suffix} globally.
`);
	}

	embed.addFields({ name: 'Events', value: events });
	await interaction.editReply({ embeds: [embed] });
};

module.exports.application_command = () => {
	return new djs.SlashCommandBuilder()
		.setName('team')
		.setDescription('Find a team by name or ID.')
		.addStringOption(option => option.setName('query').setDescription('The team name or ID to search for.').setRequired(true));
};
