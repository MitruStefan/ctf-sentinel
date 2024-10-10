const djs = require('discord.js');

module.exports.interaction = async interaction => {
	const start = Date.now();
	await interaction.reply({ content: 'Pinging... 🏓', ephemeral: true, fetchReply: true });
	const roundTripTime = Date.now() - start;
	const latency = interaction.client.ws.ping;
	if (latency === -1)
		return await interaction.editReply('⚠️ Bot latency unavailable immediately after startup. Please retry in a few seconds.');
	const button = new djs.ActionRowBuilder().addComponents(
		new djs.ButtonBuilder().setCustomId('ping').setLabel('Retake Ping').setStyle(djs.ButtonStyle.Primary).setEmoji('🔄'),
	);
	await interaction.editReply({
		content: `Pong! 🏓 Round-trip time (⏱️) is ${roundTripTime}ms. WebSocket latency (⏳) is ${latency}ms.`,
		components: [button],
	});
};
module.exports.button = async interaction => {
	const start = Date.now();
	await interaction.update({ content: 'Pinging... 🏓', ephemeral: true, fetchReply: true });
	const roundTripTime = Date.now() - start;
	const latency = interaction.client.ws.ping;
	const button = new djs.ActionRowBuilder().addComponents(
		new djs.ButtonBuilder().setCustomId('ping').setLabel('Retake Ping').setStyle(djs.ButtonStyle.Primary).setEmoji('🔄'),
	);
	await interaction.editReply({
		content: `Pong! 🏓 Round-trip time (⏱️) is ${roundTripTime}ms. WebSocket latency (⏳) is ${latency}ms.`,
		components: [button],
	});
};
module.exports.application_command = () => {
	return new djs.SlashCommandBuilder().setName('ping').setDescription("Replies with the bot's current ping and round-trip time.");
};
