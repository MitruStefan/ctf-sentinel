const djs = require('discord.js');
const { getTeam, getEventsByTeam, suff } = require('../api/api.js');

module.exports.interaction = async interaction => {
	await interaction.deferReply({ ephemeral: false });
	const query = interaction.options.getString('query');
	const sort = interaction.options.getString('sort') || 'percentage';
	const limit = interaction.options.getInteger('limit') || 5;
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

	if (sort === 'percentage') results.sort((a, b) => parseFloat(a.percentage) - parseFloat(b.percentage));
	else results.sort((a, b) => parseInt(a.place) - parseInt(b.place));

	const eventResults = results.slice(0, limit);

	let events = '';
	for (let i = 0; i < eventResults.length; i++) {
		const event = eventResults[i];
		const place = event.place;
		events += `${i + 1}. [${event.title.length > 40 ? `${event.title.slice(0, 37)}...` : event.title}](<https://ctftime.org/event/${
			event.eventId
		}>)⟶ top ${event.percentage.toFixed(2)}% (${suff(place)} place)\n`;
	}

	if (rating) {
		events =
			`${team.primary_alias || team.name} is a team from :flag_${team.country.toLowerCase()}: that has participated in ${
				results.length
			} events in ${new Date().getUTCFullYear()}.
They are ranked ${suff(rating.country_place)} in their country and ${suff(rating.rating_place)} globally.\n\n**Events**\n` + events;
	}

	if (events.length > 2048) events = events.slice(0, 2044) + '...';

	embed.setDescription(events);
	await interaction.editReply({ embeds: [embed] });
};

module.exports.application_command = () => {
	return new djs.SlashCommandBuilder()
		.setName('hall-of-fame')
		.setDescription("View a team's top-performing CTFs.")
		.addStringOption(option => option.setName('query').setDescription('The team name or ID to search for.').setRequired(true))
		.addStringOption(option =>
			option
				.setName('sort')
				.setDescription('The sorting method to use. Defaults to percentage.')
				.addChoices([
					{ name: 'Placement', value: 'place' },
					{ name: 'Percentage', value: 'percentage' },
				])
				.setRequired(false),
		)
		.addIntegerOption(option =>
			option
				.setName('limit')
				.setDescription('The maximum number of events to display. Defaults to 5.')
				.setRequired(false)
				.setMinValue(1)
				.setMaxValue(15),
		)
		.setIntegrationTypes(['GuildInstall', 'UserInstall'])
		.setContexts(['BotDM', 'Guild', 'PrivateChannel']);
};
