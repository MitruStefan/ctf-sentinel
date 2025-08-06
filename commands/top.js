const djs = require('discord.js');
const { getTopTeams, suff } = require('../api/api.js');

module.exports.interaction = async interaction => {
	await interaction.deferReply({ ephemeral: false });

	const count = interaction.options.getInteger('count') || 10;
	const topTeams = await getTopTeams(count);

	if (!topTeams || !topTeams.length) {
		return interaction.editReply({ content: 'Unable to fetch top teams at the moment.' });
	}

	const embed = new djs.EmbedBuilder()
		.setColor(global.config.color)
		.setTitle(`🏆 Top ${count} Teams in ${new Date().getUTCFullYear()}`)
		.setURL('https://ctftime.org/stats/');

	let description = '';
	for (let i = 0; i < topTeams.length; i++) {
		const team = topTeams[i];
		const place = i + 1;
		const medal = place <= 3 ? (place === 1 ? '🥇' : place === 2 ? '🥈' : '🥉') : '';

		description += `${medal} ${suff(place)} - [${team['team_name']}](https://ctftime.org/team/${team['team_id']}/)`;
		description += ` ${team['points'].toFixed(2)} points`;

		description += '\n';
	}

	if (description.length > 4096) {
		const title = embed.data.title;
		let i = 0;
		while (description) {
			let part = description.slice(0, 4096);
			let remaining = description.slice(4096);

			const lastNewlineIndex = part.lastIndexOf('\n');
			if (lastNewlineIndex !== -1) {
				remaining = part.slice(lastNewlineIndex + 1) + remaining;
				part = part.slice(0, lastNewlineIndex);
			}

			description = remaining;
			if (i == 0) {
				i++;
				embed.setDescription(part);
				embed.setTitle(title + ` - part ${i}`);
				await interaction.editReply({ embeds: [embed] });
			} else {
				const partEmbed = new djs.EmbedBuilder(embed);
				partEmbed.setTitle(title + ` - part ${i + 1}`);
				partEmbed.setDescription(part);
				await interaction.followUp({ embeds: [partEmbed] });
			}
		}
	} else embed.setDescription(description), interaction.editReply({ embeds: [embed] });
};

module.exports.application_command = () => {
	return new djs.SlashCommandBuilder()
		.setName('top')
		.setDescription('View the top CTF teams globally.')
		.addIntegerOption(option =>
			option
				.setName('count')
				.setDescription('Number of top teams to display (1-100, default: 10)')
				.setMinValue(1)
				.setMaxValue(100)
				.setRequired(false),
		)
		.setIntegrationTypes(['GuildInstall', 'UserInstall'])
		.setContexts(['BotDM', 'Guild', 'PrivateChannel']);
};
