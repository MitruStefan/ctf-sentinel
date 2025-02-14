const djs = require('discord.js');
const { getTeam, getEventsByTeam, suff } = require('../api/api.js');

module.exports.interaction = async interaction => {
	await interaction.deferReply({ ephemeral: false });
	const query = interaction.options.getString('query');
	const team = await getTeam(query);
	if (!team) return interaction.editReply({ content: 'Team not found.' });
	const results = await getEventsByTeam(team.id);
	if (!results?.length) return interaction.editReply({ content: 'No details found for this team.' });

	const embed = new djs.EmbedBuilder()
		.setColor(global.config.color)
		.setTitle(`${team.primary_alias || team.name}`)
		.setURL(`https://ctftime.org/team/${team.id}/`);

	if (team.logo) embed.setThumbnail(team.logo);

	const rating = team.rating[new Date().getFullYear()];

	let events = '';
	let remainingEvents = 0;
	for (const event of results.reverse()) {
		const place = event.place;
		const eventString = `${suff(place)}【[${
			event.title.length > 40 ? `${event.title.slice(0, 37)}...` : event.title
		}](<https://ctftime.org/event/${event.eventId}>)】${event.points.slice(0, -5)} pts\n`;
		if (events.length + eventString.length > 1008) {
			remainingEvents++;
		} else {
			events += eventString;
		}
	}

	if (remainingEvents > 0) {
		events += `and ${remainingEvents} more...`;
	}
	if (rating) {
		embed.setDescription(`
${team.primary_alias || team.name} is a team from :flag_${team.country.toLowerCase()}: that has participated in ${
			results.length
		} events in ${new Date().getUTCFullYear()}.
They are ranked ${suff(rating.country_place)} in their country and ${suff(rating.rating_place)} globally.
`);
	}

	embed.addFields({ name: 'Events', value: events });
	await interaction.editReply({ embeds: [embed] });
};

module.exports.application_command = () => {
	return new djs.SlashCommandBuilder()
		.setName('team')
		.setDescription("View a team's details by name or ID.")
		.addStringOption(option => option.setName('query').setDescription('The team name or ID to search for.').setRequired(true))
		.setIntegrationTypes(['GuildInstall', 'UserInstall'])
		.setContexts(['BotDM', 'Guild', 'PrivateChannel']);
};
