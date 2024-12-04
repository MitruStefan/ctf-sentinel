const djs = require('discord.js');
const fs = require('fs');
require('dotenv').config();
const settings = { token: process.env.TOKEN, ownerId: process.env.OWNERID, color: '#0394fc', timezone: 'Europe/Bucharest' };
global.config = settings;
const client = new djs.Client({
	intents: ['Guilds', 'GuildMessages', 'DirectMessages' /*, 'GuildMembers'*/].map(r => djs.IntentsBitField.Flags[r]),
	partials: ['Channel', 'Message'].map(r => djs.Partials[r]),
});

const files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = {};
files.forEach(file => {
	commands[file.slice(0, -3)] = require(`./commands/${file}`);
});

const log = require('./utilities/log.js');

client.once('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	if (!fs.existsSync('logs.csv')) {
		fs.writeFileSync('logs.csv', 'Date,Time,Type,Message,Name,Command,Channel\n', 'utf8');
	}
	log(client.user.username, 'ready');
	await require('./deploy-commands.js')(client);
	setTimeout(() => {
		console.log('Restarting bot...');
		process.exit(0);
	}, 24 * 60 * 60 * 1000);
});

client.on('messageCreate', async msg => {
	if (msg.guildId === null && msg.content === `<@${client.user.id}> csv` && msg.author.id === settings.ownerId) {
		msg.channel.send({ files: ['logs.csv'] });
	}
	if (msg.author.id === settings.ownerId && msg.content.startsWith(`<@${client.user.id}> eval`)) {
		const code = msg.content.split('```')[1];
		try {
			const result = eval(code);
			msg.channel.send({ content: `\`\`\`js\n${result}\`\`\`` });
		} catch (err) {
			msg.channel.send({ content: `\`\`\`js\n${err}\`\`\`` });
		}
	}
});

client.on('interactionCreate', async interaction => {
	try {
		log(interaction, 'command');
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
		const base = {};
		base.interaction = interaction;
		base.error = err;
		log(base, 'error');
		if (interaction.replied || interaction.deferred) await interaction.followUp(err_payload);
		else await interaction.reply(err_payload);
		throw err;
	}
});

client.login(settings.token);
