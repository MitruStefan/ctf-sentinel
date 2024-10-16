const djs = require('discord.js');

function getCommands() {
	const comms = require('../deploy-commands').get();
	const commands = {
		Commands: [
			[comms['help'], 'View this menu'],
			[comms['team'], "View a team's details by name or ID."],
			[comms['upcoming'], 'Lists all CTFs occurring within the next 7 days.'],
			[comms['ping'], "Replies with the bot's current ping and round-trip time."],
		],
	};

	return commands;
}

module.exports.interaction = async interaction => {
	const commands = getCommands();
	const description = Object.entries(commands)
		.map(([category, cmds]) => {
			return `${cmds.map(([name, desc]) => `- ${name} - ${desc}`).join('\n')}`;
		})
		.join('\n\n');
	const embed = new djs.EmbedBuilder()
		.setColor(global.config.color)
		.setTitle('Commands List')
		.setDescription(description + `\n\n**Need help?**\n- Visit the [Github](https://github.com/MitruStefan/ctf-sentinel) page`);
	await interaction.reply({ embeds: [embed] });
};

module.exports.application_command = SlashCommandBuilder => {
	return new djs.SlashCommandBuilder()
		.setName('help')
		.setDescription('Find out what the bot does')
		.setIntegrationTypes(['GuildInstall', 'UserInstall'])
		.setContexts(['BotDM', 'Guild', 'PrivateChannel']);
};
