const djs = require('discord.js');
const fs = require('fs');
require('dotenv').config();
const settings = { token: process.env.TOKEN, color: '#0394fc' };
global.config = settings;
const client = new djs.Client({
	intents: ['Guilds', 'GuildMessages', 'GuildMembers'].map(r => djs.IntentsBitField.Flags[r]),
});

const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = {};
files.forEach(file => {
	commands[file.slice(0, -3)] = require(`./commands/${file}`);
});

client.once('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	await require('./deploy-commands.js')(client);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.member) return;
	try {
		if (interaction.isCommand()) {
			const command = commands[interaction.commandName];
			if (command?.interaction) {
				await command.interaction(interaction);
			}
		} else if (interaction.isButton()) {
			const command = commands[interaction.customId.split('-')[0]];
			if (command?.button) {
				await command.button(interaction);
			}
		}
	} catch (err) {
		const err_payload = { content: `There was an error while executing this command!\n${err}`, ephemeral: true };
		console.log(err);
		if (interaction.replied || interaction.deferred) interaction.followUp(err_payload);
		else await interaction.reply(err_payload);
	}
});

client.login(settings.token);
