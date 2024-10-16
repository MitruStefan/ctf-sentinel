const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const fs = require('fs');
let comms = {};
module.exports = async client => {
	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

	let commands = [];

	for (const file of commandFiles) {
		const command = require(`./commands/${file}`);
		if (command.application_command) {
			commands.push(command.application_command());
		}
	}

	const rest = new REST({ version: '10' }).setToken(client.token);
	const slash_commands = await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
	slash_commands.forEach(c => {
		comms[c.name] = `</${c.name}:${c.id}>`;
	});
	console.log('Successfully registered the following commands:\n' + slash_commands.map((c, i) => `${i + 1}. /${c.name}`).join('\n'));
};

module.exports.get = () => {
	return comms;
};
