const djs = require('discord.js');
const { getUpcomingEvents } = require('../api/api.js');

module.exports.interaction = async interaction => {
	await interaction.deferReply({ ephemeral: false });
	const limit = interaction.options.getInteger('limit');
	const sort = interaction.options.getString('sort');
	const show_description =
		interaction.options.getBoolean('show_description') === null ? true : interaction.options.getBoolean('show_description');

	const upcoming_events = await getUpcomingEvents();
	const events = upcoming_events
		.sort((a, b) => {
			if (sort === 'weight') {
				return b.weight - a.weight;
			} else if (sort === 'end') {
				return new Date(a.finish) - new Date(b.finish);
			} else if (sort === 'start') {
				return new Date(a.start) - new Date(b.start);
			} else if (sort === 'participants') {
				return b.participants - a.participants;
			} else if (sort === 'duration') {
				return new Date(a.finish) - new Date(a.start) - (new Date(b.finish) - new Date(b.start));
			} else {
				return b.weight - a.weight;
			}
		})
		.slice(0, limit || 5);
	const embed = new djs.EmbedBuilder()
		.setColor(global.config.color)
		.setTitle(`Upcoming CTFs`)
		.setURL(`https://ctftime.org/event/list/upcoming`)
		.setDescription('Here are the upcoming CTFs in the next 7 days:')
		.setThumbnail('attachment://flag.png');
	for (let i = 0; i < events.length; i++) {
		const event = events[i];
		const startTime = new Date(event.start);
		const endTime = new Date(event.finish);
		let value = `:number_${i + 1}: **[${event.title.length > 40 ? `${event.title.slice(0, 37)}...` : event.title}](${
			event.ctftime_url
		})**
\nBegins: <t:${Math.floor(startTime.getTime() / 1000)}:f>\nEnds: <t:${Math.floor(endTime.getTime() / 1000)}:f>
Format: ${event.format}
Website: <${event.url}>
Weight: ${event.weight}
Participants: ${event.participants}
Location: ${
			event.location.length ? `${event.onsite ? event.location : event.location + ' and Online'}` : event.onsite ? 'Onsite' : 'Online'
		}
Prizes: ${event.prizes ? `${event.prizes}` : 'None'}`;
		if (show_description)
			value += `\nDescription:\n\n${
				event.description
					? event.description.length + value.length > 950
						? event.description.slice(0, 950 - value.length)
						: event.description
					: 'None'
			}`;

		embed.addFields({
			name: '──────────★──────────', //\u200B
			value: value,
		});
	}
	await interaction.editReply({ embeds: [embed], files: [{ attachment: 'assets/flag.png', name: 'flag.png' }] });
};

module.exports.application_command = () => {
	return new djs.SlashCommandBuilder()
		.setName('upcoming')
		.setDescription('List all CTFs occurring within the next 7 days.')
		.addIntegerOption(option =>
			option
				.setName('limit')
				.setDescription('The maximum number of events to display. Defaults to 5.')
				.setRequired(false)
				.setMinValue(1)
				.setMaxValue(25),
		)
		.addStringOption(option =>
			option
				.setName('sort')
				.setDescription('The sorting method for the events. Defaults to weight.')
				.setRequired(false)
				.addChoices(
					{ name: 'Weight', value: 'weight' },
					{ name: 'End Time', value: 'end' },
					{ name: 'Start Time', value: 'start' },
					{ name: 'Participants', value: 'participants' },
					{ name: 'Duration', value: 'duration' },
				),
		)
		.addBooleanOption(option =>
			option.setName('show_description').setDescription('Include the description of the event. Defaults to true.').setRequired(false),
		)
		.setIntegrationTypes(['GuildInstall', 'UserInstall'])
		.setContexts(['BotDM', 'Guild', 'PrivateChannel']);
};
