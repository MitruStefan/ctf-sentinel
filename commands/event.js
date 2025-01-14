const djs = require('discord.js');
const { getEventByIdOrName } = require('../api/api.js');

module.exports.interaction = async interaction => {
	await interaction.deferReply({ ephemeral: false });
	const query = interaction.options.getString('query');
	const event = await getEventByIdOrName(query);
	if (!event) return interaction.editReply({ content: 'Event not found.' });

	const embed = new djs.EmbedBuilder()
		.setColor(global.config.color)
		.setTitle(`${event.title}`)
		.setURL(`https://ctftime.org/event/${event.id}/`)
		.setDescription(event.description || 'No description available.')
		.setThumbnail('attachment://flag.png')
		.addFields(
			{ name: 'Start Time', value: `<t:${Math.floor(new Date(event.start).getTime() / 1000)}:F>`, inline: true },
			{ name: 'End Time', value: `<t:${Math.floor(new Date(event.finish).getTime() / 1000)}:F>`, inline: true },
			{ name: 'Weight', value: `${event.weight}`, inline: true },
			{ name: 'Participants', value: `${event.participants}`, inline: true },
			{ name: 'Location', value: event.location || 'Online', inline: true },
			{ name: 'Website', value: event.url || 'None', inline: true },
			{ name: 'Prizes', value: event.prizes ? event.prizes : 'None' },
			{ name: 'Description', value: event.description || 'No description available.' },
		);

	if (event.logo) {
		embed.setThumbnail(event.logo);
		await interaction.editReply({ embeds: [embed] });
	} else await interaction.editReply({ embeds: [embed], files: [{ attachment: 'assets/flag.png', name: 'flag.png' }] });
};

module.exports.application_command = () => {
	return new djs.SlashCommandBuilder()
		.setName('event')
		.setDescription('View an event by name or ID.')
		.addStringOption(option => option.setName('query').setDescription('The event name or ID to search for.').setRequired(true))
		.setIntegrationTypes(['GuildInstall', 'UserInstall'])
		.setContexts(['BotDM', 'Guild', 'PrivateChannel']);
};
