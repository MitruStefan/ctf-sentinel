const djs = require('discord.js');
const { getTeam, getEventsByTeam } = require('../api/api.js');

const suff = nr => {
	if (nr % 100 < 11 || nr % 100 > 13) {
		if (nr % 10 == 1) return nr + 'st';
		if (nr % 10 == 2) return nr + 'nd';
		if (nr % 10 == 3) return nr + 'rd';
	}
	return nr + 'th';
};
module.exports.interaction = async interaction => {
	await interaction.deferReply({ ephemeral: false });
	const query = interaction.options.getString('query');
	const team = await getTeam(query);
	if (!team) return interaction.editReply({ content: 'Team not found.' });
	const results = await getEventsByTeam(team.id);
	if (!results?.length) return interaction.editReply({ content: 'No details found for this team.' });

	const embed = new djs.EmbedBuilder()
		.setColor(global.config.color)
		.setTitle(`${team.name}`)
		.setURL(`https://ctftime.org/team/${team.id}/`);

	if (team.logo) embed.setThumbnail(team.logo);

	const rating = team.rating[new Date().getFullYear()];
	
	// sort events by percentage
	results.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));
	
	let events = '';
	let i = 1;
	for (const event of results.reverse()) {
		const place = event.place;
		const eventString = `${i}. [${event.title.length > 40 ? `${event.title.slice(0, 37)}...` : event.title}](<https://ctftime.org/event/${event.eventId}>)⟶ top ${event.percentage.toFixed(2)}% (${suff(place)} place)\n`;
		events += eventString;
		i += 1;
		if (i > 5) break
	}

	if (rating) {
		embed.setDescription(`
${team.name} is a team from :flag_${team.country.toLowerCase()}: that has participated in ${results.length} events in 2024.
They are ranked ${suff(rating.country_place)} in their country and ${suff(rating.rating_place)} globally.
`);
	}

	embed.addFields({ name: 'Events', value: events });
	await interaction.editReply({ embeds: [embed] });
};

module.exports.application_command = () => {
	return new djs.SlashCommandBuilder()
		.setName('hof')
		.setDescription("View a team's top-performing CTFs.")
		.addStringOption(option => option.setName('query').setDescription('The team name or ID to search for.').setRequired(true))
		.setIntegrationTypes(['GuildInstall', 'UserInstall'])
		.setContexts(['BotDM', 'Guild', 'PrivateChannel']);
};
