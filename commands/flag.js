const djs = require('discord.js');

module.exports.interaction = async interaction => {
	await interaction.reply({ content: `nullctf{c0m1ng_500n_1n_m1d_2025}`, ephemeral: true });
};

module.exports.application_command = SlashCommandBuilder => {
	return new djs.SlashCommandBuilder()
		.setName('flag')
		.setDescription('Get the flag')
		.setIntegrationTypes(['GuildInstall', 'UserInstall'])
		.setContexts(['BotDM', 'Guild', 'PrivateChannel']);
};
