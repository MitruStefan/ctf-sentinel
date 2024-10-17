const fs = require('fs');
const log = (base, type) => {
	let logEntry = '';
	const time = new Date().toLocaleString('en-UK', { timeZone: global.config.timezone }).replace(' ', '');
	if (type == 'command') {
		const username = base.user.username;
		const command = base.commandName || base.customId;
		const interactionType = base.isCommand() ? 'Command' : 'Button';
		const channel = base?.channel?.name || base.context === 0 ? 'Guild (User)' : base.context === 1 ? 'Bot DM' : 'Private Channel';
		// Date, Time, Username, Command, Channel
		logEntry = `${time},${interactionType},,${username},${command},${channel}\n`;
	} else if (type == 'error') {
		const message = `${base.error?.name} ${base.error?.message}${base.error?.stack?.split('\n')[1]?.replace(',', ' ')}`;
		const username = base.interaction?.user?.username || 'N/A';
		const command = base.interaction?.commandName || base.interaction?.customId || 'N/A';
		const channel =
			base.interaction?.channel?.name || base.interaction?.context === 0
				? 'Guild (User)'
				: base.interaction?.context === 1
				? 'Bot DM'
				: 'Private Channel';
		logEntry = `${time},Error,${message},${username},${command},${channel}\n`;
	} else if (type == 'ready') {
		logEntry = `${time},Bot Online,,${base},,\n`;
	} else if (type == 'api') {
		logEntry = `${time},API Uncached Call,${base.status},${base.url.replace('https://ctftime.org/', '')},,\n`;
	}
	fs.appendFileSync('logs.csv', logEntry, 'utf8');
};

module.exports = log;
